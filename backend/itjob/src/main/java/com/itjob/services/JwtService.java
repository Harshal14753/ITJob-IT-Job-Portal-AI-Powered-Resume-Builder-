package com.itjob.services;

import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;

import com.itjob.entities.User;

import io.jsonwebtoken.Claims;

public interface JwtService {

    public String generateAccessToken(User user);

    public String generateRefreshToken(User user);

    public String extractUsername(String token);

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver);

    public boolean isTokenExpired(String token);

    public boolean isTokenValid(
            String token,
            UserDetails userDetails);

}
