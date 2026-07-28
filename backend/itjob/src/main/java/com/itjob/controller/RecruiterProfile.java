package com.itjob.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.RecruiterProfileRequest;
import com.itjob.dto.RecruiterProfileResponse;
import com.itjob.services.ProfileService;
import com.itjob.services.RecruiterService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterProfile {

    private final RecruiterService recruiterService;
    private final ProfileService profileService;

    @PostMapping("/profile")
    public ResponseEntity<RecruiterProfileResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody RecruiterProfileRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                recruiterService.createProfile(
                        email,
                        request
                )
        );
    }
    
    @GetMapping("/profile")
    public ResponseEntity<RecruiterProfileResponse> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                recruiterService.getProfile(email)
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody RecruiterProfileRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                recruiterService.updateProfile(
                        email,
                        request
                )
        );
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteProfile(
            Authentication authentication) {

        String email = authentication.getName();

        recruiterService.deleteProfile(email);

        return ResponseEntity.noContent().build();
    }

    // ========== Search Talent ==========

    @GetMapping("/candidates/search")
    public ResponseEntity<List<ApplicantResponse>> searchCandidates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location
    ) {
        return ResponseEntity.ok(
                profileService.searchCandidates(search, location)
        );
    }

}
