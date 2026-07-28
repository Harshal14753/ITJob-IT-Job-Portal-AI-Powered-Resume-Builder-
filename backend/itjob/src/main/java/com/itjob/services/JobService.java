package com.itjob.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.ApplicationResponse;
import com.itjob.dto.ApplicationStatusRequest;
import com.itjob.dto.DashboardResponse;
import com.itjob.dto.JobRequest;
import com.itjob.dto.JobResponse;

public interface JobService {

    public void createJob(JobRequest request, String email);

    public List<JobResponse> getAllJobs(String email);

    public JobResponse getJobById( UUID jobId, String email);

    public JobResponse updateJob(UUID jobId, JobRequest request, String email);

    public void deleteJob( UUID jobId, String email);

    // Draft methods
    public JobResponse saveDraft(JobRequest request, String email);

    public void publishDraft(UUID jobId, String email);

    // Candidate methods
    public Page<JobResponse> getAllJobsForCandidate(String candidateEmail, Pageable pageable);

    public JobResponse getJobByIdForCandidate(UUID jobId, String candidateEmail);

    public void applyForJob(UUID jobId, String candidateEmail);

    public Page<ApplicationResponse> getCandidateApplications(String candidateEmail, Pageable pageable);

    // Search & filter jobs for candidates
    public Page<JobResponse> searchJobs(List<String> skills, String location, Integer minExperience, String candidateEmail, Pageable pageable);

    // Recruiter dashboard
    public DashboardResponse getDashboardData(String recruiterEmail);

    // Recruiter — applicant management methods
    public List<ApplicantResponse> getApplicantsForJob(UUID jobId, String recruiterEmail);

    public Page<ApplicantResponse> getApplicantsForJob(UUID jobId, String recruiterEmail, Pageable pageable);

    public ApplicantResponse getApplicantById(UUID jobId, UUID applicationId, String recruiterEmail);

    public void updateApplicationStatus(UUID jobId, UUID applicationId, ApplicationStatusRequest request, String recruiterEmail);
}
