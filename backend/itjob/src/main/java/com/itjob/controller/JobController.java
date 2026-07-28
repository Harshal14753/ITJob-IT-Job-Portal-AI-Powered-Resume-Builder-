package com.itjob.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.ApplicationStatusRequest;
import com.itjob.dto.DashboardResponse;
import com.itjob.dto.JobRequest;
import com.itjob.dto.JobResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;

import com.itjob.services.JobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/recruiter/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobService jobService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                jobService.getDashboardData(authentication.getName())
        );
    }

    @PostMapping
    public ResponseEntity<String> createJob(
        @RequestBody JobRequest request,
        Authentication authentication
    ){
        String email = authentication.getName();
        jobService.createJob(request, email);
        return ResponseEntity.ok("Job created successfully");
    }

    @PostMapping("/draft")
    public ResponseEntity<JobResponse> saveDraft(
        @RequestBody JobRequest request,
        Authentication authentication
    ) {
        String email = authentication.getName();
        JobResponse draft = jobService.saveDraft(request, email);
        return ResponseEntity.ok(draft);
    }

    @PostMapping("/{jobId}/publish")
    public ResponseEntity<String> publishDraft(
        @PathVariable UUID jobId,
        Authentication authentication
    ) {
        String email = authentication.getName();
        jobService.publishDraft(jobId, email);
        return ResponseEntity.ok("Job published successfully");
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                jobService.getAllJobs(authentication.getName())
        );
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                jobService.getJobById(jobId, authentication.getName())
        );
    }


    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable UUID jobId,
            @RequestBody JobRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                jobService.updateJob(
                        jobId,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJob(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {

        jobService.deleteJob(
                jobId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }

    // ========== Applicant Management ==========

    @GetMapping("/{jobId}/applicants")
    public ResponseEntity<Page<ApplicantResponse>> getApplicants(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        return ResponseEntity.ok(
                jobService.getApplicantsForJob(jobId, authentication.getName(), pageable)
        );
    }

    @GetMapping("/{jobId}/applicants/{applicationId}")
    public ResponseEntity<ApplicantResponse> getApplicantById(
            @PathVariable UUID jobId,
            @PathVariable UUID applicationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                jobService.getApplicantById(jobId, applicationId, authentication.getName())
        );
    }

    @PatchMapping("/{jobId}/applicants/{applicationId}/status")
    public ResponseEntity<String> updateApplicationStatus(
            @PathVariable UUID jobId,
            @PathVariable UUID applicationId,
            @RequestBody ApplicationStatusRequest request,
            Authentication authentication
    ) {
        jobService.updateApplicationStatus(jobId, applicationId, request, authentication.getName());

        return ResponseEntity.ok("Application status updated successfully");
    }


}
