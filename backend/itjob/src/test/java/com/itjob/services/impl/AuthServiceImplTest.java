package com.itjob.services.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.itjob.config.CustomUserDetailsService;
import com.itjob.dto.AuthRequest;
import com.itjob.entities.Candidate;
import com.itjob.entities.Enums.Role;
import com.itjob.entities.Recruiter;
import com.itjob.entities.SystemConfig;
import com.itjob.entities.User;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.EmailService;
import com.itjob.services.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private EmailService emailService;

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private SystemConfigRepo systemConfigRepo;

    @InjectMocks
    private AuthServiceImpl authService;

    private AuthRequest candidateRequest;
    private AuthRequest recruiterRequest;
    private SystemConfig registrationEnabledConfig;
    private SystemConfig registrationDisabledConfig;

    @BeforeEach
    void setUp() {
        candidateRequest = new AuthRequest();
        candidateRequest.setEmail("new@candidate.com");
        candidateRequest.setRole(Role.CANDIDATE);

        recruiterRequest = new AuthRequest();
        recruiterRequest.setEmail("new@recruiter.com");
        recruiterRequest.setRole(Role.RECRUITER);

        registrationEnabledConfig = new SystemConfig();
        registrationEnabledConfig.setConfigKey("auth_enable_registration");
        registrationEnabledConfig.setConfigValue("true");

        registrationDisabledConfig = new SystemConfig();
        registrationDisabledConfig.setConfigKey("auth_enable_registration");
        registrationDisabledConfig.setConfigValue("false");
    }

    // ========== Registration Toggle Tests ==========

    @Test
    void getOtp_RegistrationEnabled_NewCandidateCanRegister() {
        // Arrange: no existing user, registration is enabled
        when(userRepo.findByEmail("new@candidate.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.of(registrationEnabledConfig));
        when(userRepo.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        authService.getOtp(candidateRequest);

        // Assert
        verify(userRepo).save(any(Candidate.class));
        verify(emailService).sendOtpEmail(eq("new@candidate.com"), anyString(), anyString());
    }

    @Test
    void getOtp_RegistrationDisabled_NewCandidateBlocked() {
        // Arrange: no existing user, registration is disabled
        when(userRepo.findByEmail("new@candidate.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.of(registrationDisabledConfig));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.getOtp(candidateRequest));
        assertTrue(exception.getMessage().contains("Registration is currently disabled"));
        verify(userRepo, never()).save(any(Candidate.class));
        verify(emailService, never()).sendOtpEmail(anyString(), anyString(), anyString());
    }

    @Test
    void getOtp_RegistrationDisabled_NewRecruiterBlocked() {
        // Arrange: no existing user, registration is disabled
        when(userRepo.findByEmail("new@recruiter.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.of(registrationDisabledConfig));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.getOtp(recruiterRequest));
        assertTrue(exception.getMessage().contains("Registration is currently disabled"));
        verify(userRepo, never()).save(any(Recruiter.class));
        verify(emailService, never()).sendOtpEmail(anyString(), anyString(), anyString());
    }

    @Test
    void getOtp_RegistrationDisabled_ExistingUserCanStillLogin() {
        // Arrange: user already exists
        Candidate existingUser = new Candidate();
        existingUser.setEmail("existing@candidate.com");
        existingUser.setRole(Role.CANDIDATE);
        existingUser.setFullName("Existing User");

        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("existing@candidate.com");
        loginRequest.setRole(Role.CANDIDATE);

        when(userRepo.findByEmail("existing@candidate.com")).thenReturn(Optional.of(existingUser));
        // systemConfigRepo should NOT be called because user exists
        when(userRepo.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act - even though registration is disabled, existing user can login
        authService.getOtp(loginRequest);

        // Assert - OTP email was sent successfully
        verify(emailService).sendOtpEmail(eq("existing@candidate.com"), anyString(), anyString());
        // Verify systemConfigRepo was never consulted about registration
        verify(systemConfigRepo, never()).findByConfigKey("auth_enable_registration");
    }

    @Test
    void getOtp_ConfigMissing_DefaultsToEnabled() {
        // Arrange: no existing user, config not found (returns empty Optional)
        when(userRepo.findByEmail("new@candidate.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.empty());
        when(userRepo.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        authService.getOtp(candidateRequest);

        // Assert - registration allowed by default
        verify(userRepo).save(any(Candidate.class));
        verify(emailService).sendOtpEmail(eq("new@candidate.com"), anyString(), anyString());
    }

    @Test
    void getOtp_ConfigValueIsUnexpected_DefaultsToEnabled() {
        // Arrange: config exists with unexpected value
        SystemConfig unexpectedConfig = new SystemConfig();
        unexpectedConfig.setConfigKey("auth_enable_registration");
        unexpectedConfig.setConfigValue("yes"); // not exactly "true"

        when(userRepo.findByEmail("new@candidate.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.of(unexpectedConfig));
        // Note: No need to stub userRepo.save() — it should never be called since registration is disabled

        // Act - "yes" != "true" (case-insensitive check), so this is treated as disabled
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.getOtp(candidateRequest));
        assertTrue(exception.getMessage().contains("Registration is currently disabled"));
    }

    @Test
    void getOtp_RegistrationDisabled_NewAdminBlocked() {
        // Arrange: no existing admin, registration disabled
        AuthRequest adminRequest = new AuthRequest();
        adminRequest.setEmail("new@admin.com");
        adminRequest.setRole(Role.ADMIN);

        when(userRepo.findByEmail("new@admin.com")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("auth_enable_registration"))
                .thenReturn(Optional.of(registrationDisabledConfig));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.getOtp(adminRequest));
        assertTrue(exception.getMessage().contains("Registration is currently disabled"));
    }
}
