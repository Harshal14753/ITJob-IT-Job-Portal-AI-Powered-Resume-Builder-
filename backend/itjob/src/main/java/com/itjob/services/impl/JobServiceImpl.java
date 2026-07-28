package com.itjob.services.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.ApplicationResponse;
import com.itjob.dto.ApplicationStatusRequest;
import com.itjob.dto.DashboardResponse;
import com.itjob.dto.JobRequest;
import com.itjob.dto.JobResponse;
import com.itjob.entities.Application;
import com.itjob.entities.Candidate;
import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Job;
import com.itjob.entities.Recruiter;
import com.itjob.entities.Skills;
import com.itjob.entities.SystemConfig;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.mapper.JobMapper;
import com.itjob.repository.ApplicationRepo;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.JobRepo;
import com.itjob.repository.RecruiterRepo;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.services.JobService;
import com.itjob.services.MatchService;
import com.itjob.services.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final RecruiterRepo recruiterRepo;
    private final JobRepo jobRepo;
    private final JobMapper jobMapper;
    private final CandidateRepo candidateRepo;
    private final ApplicationRepo applicationRepo;
    private final SystemConfigRepo systemConfigRepo;
    private final NotificationService notificationService;
    private final MatchService matchService;

    private String getConfigValue(String key, String defaultValue) {
        return systemConfigRepo.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    private int getConfigInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(getConfigValue(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private boolean getConfigBool(String key, boolean defaultValue) {
        return Boolean.parseBoolean(getConfigValue(key, String.valueOf(defaultValue)));
    }

    @Override
    public void createJob(JobRequest request, String email) {

        Recruiter recruiter = recruiterRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found!"));

        // ---- Job Setting: Max Jobs Per Recruiter ----
        int maxJobs = getConfigInt("job_max_per_recruiter", 50);
        long activeJobs = jobRepo.countActiveJobsByRecruiterEmail(email);
        if (activeJobs >= maxJobs) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You have reached the maximum limit of " + maxJobs + " active jobs."
            );
        }

        // ---- Job Setting: Allow Duplicate Jobs ----
        boolean allowDuplicates = getConfigBool("job_allow_duplicates", false);
        if (!allowDuplicates) {
            boolean duplicateExists = jobRepo.existsDuplicateActiveJob(email, request.getTitle());
            if (duplicateExists) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "A job with this title already exists. Duplicate job listings are not allowed."
                );
            }
        }

        Job job = jobMapper.toEntity(request);
        job.setRecruiter(recruiter);
        job.setCreatedAt(LocalDateTime.now());
        job.setActive(true);

        // ---- Job Setting: Job Expiry ----
        int expiryDays = getConfigInt("job_expiry_days", 30);
        job.setExpiresAt(LocalDateTime.now().plusDays(expiryDays));

        // ---- Job Setting: Require Admin Approval ----
        boolean requireApproval = getConfigBool("job_require_admin_approval", false);
        job.setApproved(!requireApproval); // If approval not required, auto-approve

        jobRepo.save(job);
    }

    @Override
    public List<JobResponse> getAllJobs(String email) {

        Recruiter recruiter = recruiterRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found!"));

        List<Job> jobs = jobRepo.findByRecruiterEmail(email);

        return jobs.stream().map(jobMapper::toDto).toList();
    }

    @Override
    public JobResponse getJobById(
            UUID jobId,
            String email
    ) {

        Recruiter recruiter =
                recruiterRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recruiter not found"
                                ));

        Job job = jobRepo.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getRecruiter()
                .getId()
                .equals(recruiter.getId())) {

            throw new AccessDeniedException("You are not allowed to access this job");
        }

        return jobMapper.toDto(job);
    }

    @Override
    public JobResponse updateJob(
            UUID jobId,
            JobRequest request,
            String email
    ) {

        Job job = jobRepo
                .findByIdAndRecruiterEmail(jobId, email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"
                        )
                );

        jobMapper.updateEntity(job, request);

        Job updatedJob = jobRepo.save(job);

        return jobMapper.toDto(updatedJob);
    }

    @Override
    public void deleteJob(
            UUID jobId,
            String email
    ) {

        Job job = jobRepo
                .findByIdAndRecruiterEmail(jobId, email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"
                        )
                );

        jobRepo.delete(job);
    }

    @Override
    public DashboardResponse getDashboardData(String recruiterEmail) {
        // Verify recruiter exists
        Recruiter recruiter = recruiterRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        // Get all jobs for this recruiter
        List<Job> jobs = jobRepo.findByRecruiterEmail(recruiterEmail);
        long totalJobs = jobs.size();

        // Count applications across all jobs
        long totalApplications = applicationRepo.countByJobRecruiterEmail(recruiterEmail);

        // Count by status
        List<Application> allApplications = applicationRepo.findByJobRecruiterEmail(recruiterEmail, PageRequest.of(0, Integer.MAX_VALUE));
        long shortlistedCount = allApplications.stream()
                .filter(a -> a.getStatus() == com.itjob.entities.Enums.ApplicationStatus.REVIEWING)
                .count();
        long interviewingCount = allApplications.stream()
                .filter(a -> a.getStatus() == com.itjob.entities.Enums.ApplicationStatus.INTERVIEWING)
                .count();
        long acceptedCount = allApplications.stream()
                .filter(a -> a.getStatus() == com.itjob.entities.Enums.ApplicationStatus.ACCEPTED)
                .count();
        long rejectedCount = allApplications.stream()
                .filter(a -> a.getStatus() == com.itjob.entities.Enums.ApplicationStatus.REJECTED)
                .count();

        // Recent jobs (top 5)
        List<Job> recentJobs = jobRepo.findTop5ByRecruiterEmailOrderByCreatedAtDesc(recruiterEmail);
        List<DashboardResponse.RecentJob> recentJobList = recentJobs.stream()
                .map(job -> {
                    int appCount = (job.getApplications() != null) ? job.getApplications().size() : 0;
                    return DashboardResponse.RecentJob.builder()
                            .id(job.getId())
                            .title(job.getTitle())
                            .location(job.getLocation())
                            .jobType(job.getJobType())
                            .workLocation(job.getWorkLocation())
                            .totalApplicants(appCount)
                            .createdAt(job.getCreatedAt())
                            .build();
                })
                .toList();

        // Recent applicants (top 5)
        List<Application> recentApplications = applicationRepo.findByJobRecruiterEmail(recruiterEmail, PageRequest.of(0, 5));
        List<DashboardResponse.RecentApplicant> recentApplicantList = recentApplications.stream()
                .map(app -> DashboardResponse.RecentApplicant.builder()
                        .applicationId(app.getId())
                        .jobId(app.getJob().getId())
                        .jobTitle(app.getJob().getTitle())
                        .fullName(app.getCandidate().getFullName())
                        .email(app.getCandidate().getEmail())
                        .status(app.getStatus())
                        .applicationDate(app.getApplicationDate())
                        .build())
                .toList();

        // Upcoming interviews (top 5 most recently moved to INTERVIEWING)
        List<Application> interviewApps = applicationRepo.findUpcomingInterviews(recruiterEmail, PageRequest.of(0, 5));
        List<DashboardResponse.UpcomingInterview> interviewList = interviewApps.stream()
                .map(app -> DashboardResponse.UpcomingInterview.builder()
                        .applicationId(app.getId())
                        .jobId(app.getJob().getId())
                        .jobTitle(app.getJob().getTitle())
                        .fullName(app.getCandidate().getFullName())
                        .email(app.getCandidate().getEmail())
                        .statusUpdatedAt(app.getStatusUpdatedAt())
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalJobsPosted(totalJobs)
                .totalApplications(totalApplications)
                .shortlistedCount(shortlistedCount)
                .interviewingCount(interviewingCount)
                .acceptedCount(acceptedCount)
                .rejectedCount(rejectedCount)
                .recentJobs(recentJobList)
                .recentApplicants(recentApplicantList)
                .upcomingInterviews(interviewList)
                .build();
    }

    // ========== Draft Methods ==========

    @Override
    public JobResponse saveDraft(JobRequest request, String email) {
        Recruiter recruiter = recruiterRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found!"));

        Job job = jobMapper.toEntity(request);
        job.setRecruiter(recruiter);
        job.setCreatedAt(LocalDateTime.now());
        job.setActive(false);       // Mark as draft
        job.setApproved(false);
        // No expiry for drafts, no max-jobs or duplicate checks

        Job saved = jobRepo.save(job);
        return jobMapper.toDto(saved);
    }

    @Override
    public void publishDraft(UUID jobId, String email) {
        Job job = jobRepo.findByIdAndRecruiterEmail(jobId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Draft job not found"));

        // ---- Job Setting: Max Jobs Per Recruiter ----
        int maxJobs = getConfigInt("job_max_per_recruiter", 50);
        long activeJobs = jobRepo.countActiveJobsByRecruiterEmail(email);
        if (activeJobs >= maxJobs) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You have reached the maximum limit of " + maxJobs + " active jobs."
            );
        }

        // ---- Job Setting: Allow Duplicate Jobs ----
        boolean allowDuplicates = getConfigBool("job_allow_duplicates", false);
        if (!allowDuplicates) {
            boolean duplicateExists = jobRepo.existsDuplicateActiveJob(email, job.getTitle());
            if (duplicateExists) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "A job with this title already exists. Duplicate job listings are not allowed."
                );
            }
        }

        job.setActive(true);
        job.setApproved(true);  // No admin approval needed

        // ---- Job Setting: Job Expiry ----
        int expiryDays = getConfigInt("job_expiry_days", 30);
        job.setExpiresAt(LocalDateTime.now().plusDays(expiryDays));

        jobRepo.save(job);
    }

    // ========== Candidate Methods ==========

    @Override
    public Page<JobResponse> getAllJobsForCandidate(String candidateEmail, Pageable pageable) {
        // Only show approved and active jobs (not expired)
        Page<Job> jobPage = jobRepo.findAll(pageable);
        List<Job> visibleJobs = jobPage.getContent().stream()
                .filter(job -> job.isApproved() && job.isActive())
                .filter(job -> job.getExpiresAt() == null || job.getExpiresAt().isAfter(LocalDateTime.now()))
                .toList();

        Candidate candidate = null;
        if (candidateEmail != null) {
            candidate = candidateRepo.findByEmail(candidateEmail).orElse(null);
        }

        final Candidate finalCandidate = candidate;

        List<JobResponse> responses = visibleJobs.stream()
                .map(job -> {
                    JobResponse dto = jobMapper.toDto(job);
                    if (finalCandidate != null) {
                        dto.setMatchScore(matchService.computeMatchScore(finalCandidate, job));
                    }
                    return dto;
                })
                .toList();

        return new PageImpl<>(responses, pageable, jobPage.getTotalElements());
    }

    @Override
    public JobResponse getJobByIdForCandidate(UUID jobId, String candidateEmail) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Check if the job is visible
        if (!job.isApproved() || !job.isActive()) {
            throw new ResourceNotFoundException("Job not found");
        }
        if (job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Job not found");
        }

        // Check if the candidate has already applied using email directly
        boolean hasApplied = applicationRepo.existsByCandidateEmailAndJobId(candidateEmail, jobId);

        JobResponse dto = jobMapper.toDtoWithApplicationStatus(job, hasApplied);

        // Compute match score if candidate exists
        Candidate candidate = candidateRepo.findByEmail(candidateEmail).orElse(null);
        if (candidate != null) {
            dto.setMatchScore(matchService.computeMatchScore(candidate, job));
        }

        return dto;
    }

    @Override
    public Page<JobResponse> searchJobs(List<String> skills, String location, Integer minExperience, String candidateEmail, Pageable pageable) {
        // If all filters are null/empty, return all approved active jobs
        if ((skills == null || skills.isEmpty()) && (location == null || location.isBlank()) && minExperience == null) {
            return getAllJobsForCandidate(candidateEmail, pageable);
        }

        // Clean skills: trim and lowercase for matching; pass null if empty
        List<String> cleanSkills = null;
        if (skills != null && !skills.isEmpty()) {
            cleanSkills = skills.stream()
                    .map(String::toLowerCase)
                    .map(String::trim)
                    .toList();
        }

        String cleanLocation = (location != null && !location.isBlank()) ? location.trim() : null;

        Page<Job> jobPage = jobRepo.searchJobs(cleanSkills, cleanLocation, minExperience, pageable);

        // Filter to only approved active jobs
        List<Job> visibleJobs = jobPage.getContent().stream()
                .filter(job -> job.isApproved() && job.isActive())
                .filter(job -> job.getExpiresAt() == null || job.getExpiresAt().isAfter(LocalDateTime.now()))
                .toList();

        Candidate candidate = null;
        if (candidateEmail != null) {
            candidate = candidateRepo.findByEmail(candidateEmail).orElse(null);
        }

        final Candidate finalCandidate = candidate;

        List<JobResponse> responses = visibleJobs.stream()
                .map(job -> {
                    JobResponse dto = jobMapper.toDto(job);
                    if (finalCandidate != null) {
                        dto.setMatchScore(matchService.computeMatchScore(finalCandidate, job));
                    }
                    return dto;
                })
                .toList();

        return new PageImpl<>(responses, pageable, jobPage.getTotalElements());
    }

    @Override
    public void applyForJob(UUID jobId, String candidateEmail) {
        Candidate candidate = candidateRepo.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Check if job is visible and active
        if (!job.isApproved() || !job.isActive()) {
            throw new ResourceNotFoundException("Job not found");
        }
        if (job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This job posting has expired."
            );
        }

        // Check for duplicate application
        if (applicationRepo.existsByCandidateAndJob(candidate, job)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already applied for this job"
            );
        }

        Application application = new Application();
        application.setApplicationDate(LocalDate.now());
        application.setStatus(ApplicationStatus.PENDING);
        application.setStatusUpdatedAt(LocalDateTime.now());
        application.setCandidate(candidate);
        application.setJob(job);

        applicationRepo.save(application);
    }

    @Override
    public Page<ApplicationResponse> getCandidateApplications(String candidateEmail, Pageable pageable) {
        Page<Application> applicationPage = applicationRepo.findByCandidateEmail(candidateEmail, pageable);

        List<ApplicationResponse> responses = applicationPage.getContent().stream()
                .map(app -> ApplicationResponse.builder()
                        .id(app.getId())
                        .applicationDate(app.getApplicationDate())
                        .status(app.getStatus())
                        .statusUpdatedAt(app.getStatusUpdatedAt())
                        .jobId(app.getJob().getId())
                        .jobTitle(app.getJob().getTitle())
                        .jobLocation(app.getJob().getLocation())
                        .jobType(app.getJob().getJobType())
                        .workLocation(app.getJob().getWorkLocation())
                        .salaryMin(app.getJob().getSalaryMin())
                        .salaryMax(app.getJob().getSalaryMax())
                        .companyName(app.getJob().getRecruiter().getCompanyName())
                        .build()
                )
                .toList();

        return new PageImpl<>(responses, pageable, applicationPage.getTotalElements());
    }

    // ========== Recruiter — Applicant Management ==========

    @Override
    public List<ApplicantResponse> getApplicantsForJob(UUID jobId, String recruiterEmail) {
        // For backward compatibility — returns all without pagination
        return getApplicantsForJob(jobId, recruiterEmail, Pageable.unpaged()).getContent();
    }

    @Override
    public Page<ApplicantResponse> getApplicantsForJob(UUID jobId, String recruiterEmail, Pageable pageable) {
        // Verify the job belongs to the recruiter
        Job job = jobRepo
                .findByIdAndRecruiterEmail(jobId, recruiterEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job not found or you don't have access")
                );

        Page<Application> applicationPage = applicationRepo.findByJobId(jobId, pageable);

        List<ApplicantResponse> responses = applicationPage.getContent().stream()
                .map(app -> {
                    Candidate candidate = app.getCandidate();

                    // Extract latest experience for preview
                    String latestTitle = null;
                    String latestCompany = null;
                    if (candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
                        var sorted = candidate.getExperiences().stream()
                                .sorted((a, b) -> {
                                    if (a.getEndDate() == null) return -1;
                                    if (b.getEndDate() == null) return 1;
                                    return b.getEndDate().compareTo(a.getEndDate());
                                })
                                .toList();
                        latestTitle = sorted.get(0).getJobRole();
                        latestCompany = sorted.get(0).getCompanyName();
                    }

                    return ApplicantResponse.builder()
                            .applicationId(app.getId())
                            .applicationDate(app.getApplicationDate())
                            .status(app.getStatus())
                            .statusUpdatedAt(app.getStatusUpdatedAt())
                            .candidateId(candidate.getId())
                            .fullName(candidate.getFullName())
                            .email(candidate.getEmail())
                            .phoneNo(candidate.getPhoneNo())
                            .address(candidate.getAddress())
                            .githubLink(candidate.getGithubLink())
                            .linkedInLink(candidate.getLinkedInLink())
                            .portfolioLink(candidate.getPortfolioLink())
                            .about(candidate.getAbout())
                            .resumeUrl(candidate.getResumeUrl())
                            .resumePublicId(candidate.getResumePublicId())
                            .skills(candidate.getSkills() != null
                                    ? candidate.getSkills().stream()
                                            .map(Skills::getSkillName)
                                            .collect(java.util.stream.Collectors.toSet())
                                    : null)
                            .skillIds(candidate.getSkills() != null
                                    ? candidate.getSkills().stream()
                                            .map(Skills::getId)
                                            .collect(java.util.stream.Collectors.toSet())
                                    : null)
                            .latestExperienceTitle(latestTitle)
                            .latestExperienceCompany(latestCompany)
                            .build();
                })
                .toList();

        return new PageImpl<>(responses, pageable, applicationPage.getTotalElements());
    }

    @Override
    public ApplicantResponse getApplicantById(UUID jobId, UUID applicationId, String recruiterEmail) {
        // Verify the job belongs to the recruiter
        Job job = jobRepo
                .findByIdAndRecruiterEmail(jobId, recruiterEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job not found or you don't have access")
                );

        Application application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Verify the application belongs to this job
        if (!application.getJob().getId().equals(jobId)) {
            throw new ResourceNotFoundException("Application not found for this job");
        }

        Candidate candidate = application.getCandidate();

        // Extract latest experience for preview
        String latestTitle = null;
        String latestCompany = null;
        if (candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
            var sorted = candidate.getExperiences().stream()
                    .sorted((a, b) -> {
                        if (a.getEndDate() == null) return -1;
                        if (b.getEndDate() == null) return 1;
                        return b.getEndDate().compareTo(a.getEndDate());
                    })
                    .toList();
            latestTitle = sorted.get(0).getJobRole();
            latestCompany = sorted.get(0).getCompanyName();
        }

        return ApplicantResponse.builder()
                .applicationId(application.getId())
                .applicationDate(application.getApplicationDate())
                .status(application.getStatus())
                .statusUpdatedAt(application.getStatusUpdatedAt())
                .candidateId(candidate.getId())
                .fullName(candidate.getFullName())
                .email(candidate.getEmail())
                .phoneNo(candidate.getPhoneNo())
                .address(candidate.getAddress())
                .githubLink(candidate.getGithubLink())
                .linkedInLink(candidate.getLinkedInLink())
                .portfolioLink(candidate.getPortfolioLink())
                .about(candidate.getAbout())
                .resumeUrl(candidate.getResumeUrl())
                .resumePublicId(candidate.getResumePublicId())
                .skills(candidate.getSkills() != null
                        ? candidate.getSkills().stream()
                                .map(Skills::getSkillName)
                                .collect(java.util.stream.Collectors.toSet())
                        : null)
                .skillIds(candidate.getSkills() != null
                        ? candidate.getSkills().stream()
                                .map(Skills::getId)
                                .collect(java.util.stream.Collectors.toSet())
                        : null)
                .latestExperienceTitle(latestTitle)
                .latestExperienceCompany(latestCompany)
                .experiences(candidate.getExperiences())
                .educations(candidate.getEducations())
                .projects(candidate.getProjects())
                .certificates(candidate.getCertificates())
                .build();
    }

    @Override
    public void updateApplicationStatus(UUID jobId, UUID applicationId, ApplicationStatusRequest request, String recruiterEmail) {
        // Verify the job belongs to the recruiter
        Job job = jobRepo
                .findByIdAndRecruiterEmail(jobId, recruiterEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job not found or you don't have access")
                );

        Application application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Verify the application belongs to this job
        if (!application.getJob().getId().equals(jobId)) {
            throw new ResourceNotFoundException("Application not found for this job");
        }

        ApplicationStatus newStatus = request.getStatus();
        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        application.setStatus(newStatus);
        application.setStatusUpdatedAt(LocalDateTime.now());
        applicationRepo.save(application);

        // Create notification for the candidate about the status change
        String jobTitle = application.getJob().getTitle();
        String companyName = application.getJob().getRecruiter().getCompanyName();
        if (companyName == null) {
            companyName = application.getJob().getRecruiter().getEmail();
        }

        // Human-readable status labels
        String statusLabel;
        String statusVerb;
        switch (newStatus) {
            case REVIEWING:
                statusLabel = "Under Review";
                statusVerb = "moved to review";
                break;
            case INTERVIEWING:
                statusLabel = "Interview Stage";
                statusVerb = "scheduled for an interview";
                break;
            case ACCEPTED:
                statusLabel = "Accepted";
                statusVerb = "accepted";
                break;
            case REJECTED:
                statusLabel = "Rejected";
                statusVerb = "rejected";
                break;
            default:
                statusLabel = newStatus.name().replace("_", " ").toLowerCase();
                statusVerb = statusLabel;
        }

        notificationService.createNotification(
                application.getCandidate().getEmail(),
                "APPLICATION_STATUS",
                "Application " + statusLabel,
                "Your application for " + jobTitle + " at " + companyName + " has been " + statusVerb + ".",
                application.getId().toString(),
                "application");
    }

}
