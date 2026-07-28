package com.itjob.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.ApplicantResponse;
import com.itjob.services.SavedCandidateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SavedCandidateController {

    private final SavedCandidateService savedCandidateService;

    // ========== Saved Candidates ==========

    @PostMapping("/saved-candidates/{candidateId}")
    public ResponseEntity<String> saveCandidate(
            @PathVariable UUID candidateId,
            Authentication authentication
    ) {
        savedCandidateService.saveCandidate(authentication.getName(), candidateId);
        return ResponseEntity.ok("Candidate saved successfully");
    }

    @DeleteMapping("/saved-candidates/{candidateId}")
    public ResponseEntity<String> unsaveCandidate(
            @PathVariable UUID candidateId,
            Authentication authentication
    ) {
        savedCandidateService.unsaveCandidate(authentication.getName(), candidateId);
        return ResponseEntity.ok("Candidate removed from saved list");
    }

    @GetMapping("/saved-candidates")
    public ResponseEntity<List<ApplicantResponse>> getSavedCandidates(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                savedCandidateService.getSavedCandidates(authentication.getName())
        );
    }

    @GetMapping("/saved-candidates/{candidateId}/status")
    public ResponseEntity<Boolean> isCandidateSaved(
            @PathVariable UUID candidateId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                savedCandidateService.isCandidateSaved(authentication.getName(), candidateId)
        );
    }
}
