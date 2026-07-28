package com.itjob.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.AIApplySettingsRequest;
import com.itjob.dto.AIApplySettingsResponse;
import com.itjob.dto.JobResponse;
import com.itjob.services.AIApplyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/candidate/ai-apply")
@RequiredArgsConstructor
public class AIApplyController {

    private final AIApplyService aiApplyService;

    @GetMapping("/settings")
    public ResponseEntity<AIApplySettingsResponse> getSettings(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(aiApplyService.getSettings(email));
    }

    @PutMapping("/settings")
    public ResponseEntity<AIApplySettingsResponse> saveSettings(
            Authentication authentication,
            @Valid @RequestBody AIApplySettingsRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(aiApplyService.saveSettings(email, request));
    }

    /**
     * Get all jobs that match the candidate's AI apply preferences (excluding already-applied),
     * sorted by match score descending. Each job includes a computed matchScore.
     */
    @GetMapping("/review-jobs")
    public ResponseEntity<List<JobResponse>> getReviewJobs(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(aiApplyService.getReviewJobs(email));
    }

    /**
     * Apply to a specific job from the review page.
     */
    @PostMapping("/review-jobs/{jobId}/apply")
    public ResponseEntity<String> applyForReviewJob(
            @PathVariable java.util.UUID jobId,
            Authentication authentication) {
        String email = authentication.getName();
        aiApplyService.applyToJob(jobId, email);
        return ResponseEntity.ok("Application submitted successfully");
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runAutoApply(
            Authentication authentication) {
        String email = authentication.getName();
        int appliedCount = aiApplyService.runAutoApply(email);
        return ResponseEntity.ok(Map.of(
                "message", "Auto-apply completed",
                "appliedCount", appliedCount
        ));
    }
}
