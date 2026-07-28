package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.itjob.config.CustomUserDetailsService;
import com.itjob.dto.AuthRequest;
import com.itjob.dto.AuthResponse;
import com.itjob.dto.VerifyOTPRequest;
import com.itjob.entities.Candidate;
import com.itjob.entities.Enums.Role;
import com.itjob.entities.Recruiter;
import com.itjob.entities.SystemConfig;
import com.itjob.entities.User;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.AuthService;
import com.itjob.services.EmailService;
import com.itjob.services.JwtService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final SystemConfigRepo systemConfigRepo;

    private static final long LOCKOUT_DURATION_MINUTES = 15;

    // In-memory store: email -> { attemptCount, lockedUntil }
    private final Map<String, AttemptRecord> failedAttempts = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Start a background thread to periodically clean up expired lockout entries
        Thread cleaner = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(60_000); // every 60 seconds
                    LocalDateTime now = LocalDateTime.now();
                    failedAttempts.entrySet().removeIf(
                            entry -> (entry.getValue().lockedUntil != null
                                        && entry.getValue().lockedUntil.isBefore(now))
                                    || (entry.getValue().lastAttempt.plusMinutes(30).isBefore(now))
                    );
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "failed-attempts-cleaner");
        cleaner.setDaemon(true);
        cleaner.start();
    }

    private static class AttemptRecord {
        int count;
        LocalDateTime lockedUntil;
        LocalDateTime lastAttempt;

        AttemptRecord(int count, LocalDateTime lockedUntil, LocalDateTime lastAttempt) {
            this.count = count;
            this.lockedUntil = lockedUntil;
            this.lastAttempt = lastAttempt;
        }
    }

    private int getMaxLoginAttempts() {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey("auth_max_login_attempts");
        if (config.isPresent()) {
            try {
                String value = config.get().getConfigValue();
                // Handle "true"/"false" toggle values gracefully
                if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
                    return 5; // fallback to default
                }
                int max = Integer.parseInt(value);
                return Math.max(max, 1);
            } catch (NumberFormatException e) {
                // fallback
            }
        }
        return 5;
    }

    private void checkIfLocked(String email) {
        AttemptRecord record = failedAttempts.get(email);
        if (record != null && record.lockedUntil != null && record.lockedUntil.isAfter(LocalDateTime.now())) {
            long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), record.lockedUntil).toMinutes();
            throw new RuntimeException(
                    "Too many failed attempts. Please try again in " + Math.max(remainingMinutes, 1) + " minutes."
            );
        }
        // Clear expired lockout — the background cleaner handles stale non-locked entries
        if (record != null && record.lockedUntil != null) {
            failedAttempts.remove(email);
        }
    }

    private void recordFailedAttempt(String email) {
        int maxAttempts = getMaxLoginAttempts();
        AttemptRecord record = failedAttempts.get(email);
        if (record == null) {
            record = new AttemptRecord(0, null, LocalDateTime.now());
        }
        record.count++;
        record.lastAttempt = LocalDateTime.now();
        if (record.count >= maxAttempts) {
            record.lockedUntil = LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES);
        }
        failedAttempts.put(email, record);
    }

    private void clearFailedAttempts(String email) {
        failedAttempts.remove(email);
    }

    private boolean isRegistrationEnabled() {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey("auth_enable_registration");
        if (config.isPresent()) {
            return "true".equalsIgnoreCase(config.get().getConfigValue());
        }
        return true;
    }

    private long getOtpExpiryMinutes() {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey("auth_otp_expiry_time");
        if (config.isPresent()) {
            try {
                long minutes = Long.parseLong(config.get().getConfigValue());
                return Math.max(minutes, 1);
            } catch (NumberFormatException e) {
                // fallback to 5 minutes
            }
        }
        return 5;
    }

    @Override
    public void getOtp(AuthRequest authRequest) {

        String email = authRequest.getEmail();

        // Check rate limiting before allowing OTP request
        checkIfLocked(email);

        User user = userRepo.findByEmail(authRequest.getEmail()).orElse(null);

        if (user != null && user.getRole() != authRequest.getRole()) {
            throw new RuntimeException(
                    "This email is already registered as "
                    + user.getRole().name()
                    + ". Please sign in using the same role."
            );
        }

        if (user == null) {
            // Check registration toggle before creating a new account
            if (!isRegistrationEnabled()) {
                throw new RuntimeException(
                        "Registration is currently disabled. Please contact support."
                );
            }

            if (authRequest.getRole() == Role.CANDIDATE) {

                Candidate candidate = new Candidate();

                candidate.setEmail(authRequest.getEmail());
                candidate.setRole(authRequest.getRole());

                user = candidate;

            } else if (authRequest.getRole() == Role.ADMIN) {

                User adminUser = new User();

                adminUser.setEmail(authRequest.getEmail());
                adminUser.setRole(authRequest.getRole());
                adminUser.setProfileCompleted(true);

                user = adminUser;

            } else {

                Recruiter recruiter = new Recruiter();

                boolean profileCompleted
                        = recruiter.getCompanyName() != null
                        && !recruiter.getCompanyName().isBlank();

                recruiter.setEmail(authRequest.getEmail());
                recruiter.setRole(authRequest.getRole());

                user = recruiter;

            }
        }

        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(
                        100000,
                        999999
                )
        );

        user.setOtp(otp);

        user.setExpiresAt(
                LocalDateTime.now().plusMinutes(getOtpExpiryMinutes())
        );

        user.setIsUsed(false);

        userRepo.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp, (user.getRole() == Role.CANDIDATE) ? "Candidate" : "Recruiter");
    }

    @Override
    public AuthResponse verifyOtp(VerifyOTPRequest verifyOTPRequest) {

        String email = verifyOTPRequest.getEmail();

        // Check rate limiting before OTP verification
        checkIfLocked(email);

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found!"));

        if (!user.getOtp().equals(verifyOTPRequest.getOtp())) {
            // Record this failed attempt
            recordFailedAttempt(email);
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Otp Expired, Resend Otp");
        }

        if (user.getIsUsed()) {
            throw new RuntimeException("Otp is already used! Send otp again");
        }

        // Clear failed attempts on successful login
        clearFailedAttempts(email);

        String accessToken = jwtService.generateAccessToken(user);

        String refreshToken = jwtService.generateRefreshToken(user);

        user.setAccessToken(accessToken);
        user.setRefreshToken(refreshToken);

        user.setIsUsed(true);

        userRepo.save(user);

        return new AuthResponse(accessToken, refreshToken, user.getRole(), user.isProfileCompleted());
    }

    public AuthResponse refreshToken(String refreshToken) {

        String username
                = jwtService.extractUsername(
                        refreshToken
                );

        User user
                = userRepo.findByEmail(username)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(
                refreshToken,
                userDetails
        )) {
            throw new RuntimeException(
                    "Invalid refresh token"
            );
        }

        String newAccessToken
                = jwtService.generateAccessToken(
                        user
                );

        return new AuthResponse(
                newAccessToken,
                refreshToken
        );
    }

    @Override
    public void logout(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        user.setAccessToken(null);
        user.setRefreshToken(null);

        userRepo.save(user);
    }
}
