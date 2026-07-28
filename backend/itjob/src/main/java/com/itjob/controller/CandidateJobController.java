package com.itjob.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.ApplicationResponse;
import com.itjob.dto.InterviewResponse;
import com.itjob.dto.JobResponse;
import com.itjob.services.InterviewService;
import com.itjob.services.JobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/candidate/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateJobController {

    private final JobService jobService;
    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                jobService.getAllJobsForCandidate(email, pageable)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                jobService.searchJobs(skills, location, minExperience, email, pageable)
        );
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                jobService.getJobByIdForCandidate(jobId, email)
        );
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        System.out.println( "email : " + email);

        jobService.applyForJob(jobId, email);

        return ResponseEntity.ok("Application submitted successfully");
    }

    @GetMapping("/applications")
    public ResponseEntity<Page<ApplicationResponse>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        return ResponseEntity.ok(
                jobService.getCandidateApplications(email, pageable)
        );
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewResponse>> getCandidateInterviews(
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                interviewService.getCandidateInterviews(email)
        );
    }

    @GetMapping("/interviews/upcoming")
    public ResponseEntity<List<InterviewResponse>> getCandidateUpcomingInterviews(
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                interviewService.getCandidateUpcomingInterviews(email)
        );
    }
}
