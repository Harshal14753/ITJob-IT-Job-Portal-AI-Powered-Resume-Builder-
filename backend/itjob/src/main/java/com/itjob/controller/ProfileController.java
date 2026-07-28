package com.itjob.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.CandidateProfileRequest;
import com.itjob.dto.CandidateProfileResponse;
import com.itjob.services.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/candidate/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getProfile(
            Authentication authentication) {

        String email = authentication.getName();
        // System.out.println( "email" + email);
        return ResponseEntity.ok(
                profileService.getProfile(email)
        );
    }

    @PutMapping
    public ResponseEntity<CandidateProfileResponse> updateCandidateProfile(
            Authentication authentication,
            @Valid @RequestBody CandidateProfileRequest request) {

        String email = authentication.getName();

        // Verify the authenticated user is a candidate
        if (!email.equals(authentication.getName())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                profileService.updateCandidateProfile(email, request)
        );
    }
}
