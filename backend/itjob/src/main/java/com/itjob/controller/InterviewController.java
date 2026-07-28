package com.itjob.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.InterviewRequest;
import com.itjob.dto.InterviewResponse;
import com.itjob.services.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/recruiter/interviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> getAllInterviews(Authentication authentication) {
        return ResponseEntity.ok(interviewService.getAllInterviews(authentication.getName()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<InterviewResponse>> getUpcomingInterviews(Authentication authentication) {
        return ResponseEntity.ok(interviewService.getUpcomingInterviews(authentication.getName()));
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> getInterviewById(
            @PathVariable UUID interviewId,
            Authentication authentication) {
        return ResponseEntity.ok(interviewService.getInterviewById(authentication.getName(), interviewId));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<InterviewResponse>> getInterviewsForApplication(
            @PathVariable UUID applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewsForApplication(applicationId));
    }

    @PostMapping("/schedule/{applicationId}")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @PathVariable UUID applicationId,
            @RequestBody InterviewRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                interviewService.scheduleInterview(authentication.getName(), applicationId, request));
    }

    @PatchMapping("/{interviewId}/reschedule")
    public ResponseEntity<InterviewResponse> rescheduleInterview(
            @PathVariable UUID interviewId,
            @RequestBody InterviewRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                interviewService.rescheduleInterview(authentication.getName(), interviewId, request));
    }

    @PatchMapping("/{interviewId}/cancel")
    public ResponseEntity<InterviewResponse> cancelInterview(
            @PathVariable UUID interviewId,
            Authentication authentication) {
        return ResponseEntity.ok(
                interviewService.cancelInterview(authentication.getName(), interviewId));
    }

    @PatchMapping("/{interviewId}/complete")
    public ResponseEntity<InterviewResponse> completeInterview(
            @PathVariable UUID interviewId,
            Authentication authentication) {
        return ResponseEntity.ok(
                interviewService.completeInterview(authentication.getName(), interviewId));
    }
}
