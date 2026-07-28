package com.itjob.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.AuthRequest;
import com.itjob.dto.AuthResponse;
import com.itjob.dto.VerifyOTPRequest;
import com.itjob.services.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

        private final AuthService authService;


        @PostMapping("/send-otp")
        public ResponseEntity<String> sendOtp(
                @RequestBody AuthRequest request
        ){

                // System.out.println("Mail in controller : " + request.getEmail());
                // System.out.println("Role : " + request.getRole());
                authService.getOtp(request);

                return ResponseEntity.ok(
                        "OTP Sent Successfully"
                );
        }

        @PostMapping("/verify-otp")
        public ResponseEntity<AuthResponse>
        verifyOtp(
                @RequestBody
                VerifyOTPRequest request,
                HttpServletResponse response
        ){

                AuthResponse authResponse = authService.verifyOtp(request);

                Cookie refreshCookie = new Cookie("refreshToken", authResponse.getRefreshToken());

                refreshCookie.setHttpOnly(true);
                refreshCookie.setSecure(false);
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(15 * 24 * 60 * 60);

                response.addCookie(refreshCookie);

                authResponse.setRefreshToken(null);

                return ResponseEntity.ok(authResponse);
        }

        @PostMapping("/refresh")
        public ResponseEntity<AuthResponse> refreshToken(
                @CookieValue("refreshToken")
                String refreshToken) {

                AuthResponse response = authService.refreshToken(refreshToken);

                return ResponseEntity.ok(response);
        }

        @PostMapping("/logout")
        public ResponseEntity<String> logout(
                Authentication authentication) {

        authService.logout(authentication.getName());

        return ResponseEntity.ok("Logout successful");
        }

}
