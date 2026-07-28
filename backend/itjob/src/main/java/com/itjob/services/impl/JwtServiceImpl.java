package com.itjob.services.impl;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.itjob.entities.SystemConfig;
import com.itjob.entities.User;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.services.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements  JwtService {

    private final SystemConfigRepo systemConfigRepo;

    @Value("${jwt.secret}")
    private String secret;

    private long getAccessTokenExpiry() {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey("auth_jwt_access_expiry");
        if (config.isPresent()) {
            try {
                long hours = Long.parseLong(config.get().getConfigValue());
                return Math.max(hours, 1) * 60 * 60 * 1000;
            } catch (NumberFormatException e) {
                // fallback to 1 hour
            }
        }
        return 60 * 60 * 1000;
    }

    private long getRefreshTokenExpiry() {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey("auth_jwt_refresh_expiry");
        if (config.isPresent()) {
            try {
                long days = Long.parseLong(config.get().getConfigValue());
                return Math.max(days, 1) * 24 * 60 * 60 * 1000;
            } catch (NumberFormatException e) {
                // fallback to 15 days
            }
        }
        return 15 * 24 * 60 * 60 * 1000;
    }

    private Key getKey(){
        return Keys.hmacShaKeyFor(
            secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    public String generateAccessToken(User user) {

    return Jwts.builder()
            .subject(user.getEmail())
            .claim("role", user.getRole().name())
            .issuedAt(new Date())
            .expiration(new Date(
                System.currentTimeMillis() + getAccessTokenExpiry()
            ))
            .signWith(getKey())
            .compact();
    }

    @Override
    public String generateRefreshToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(
                    System.currentTimeMillis() + getRefreshTokenExpiry()
                ))
                .signWith(getKey())
                .compact();
    }

    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

     public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @Override
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        final Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public boolean isTokenExpired(String token) {
        return extractExpiration(token)
                .before(new Date());
    }

    @Override
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        final String username =
                extractUsername(token);

        return username.equals(
                userDetails.getUsername())
                &&
                !isTokenExpired(token);
    }
}
