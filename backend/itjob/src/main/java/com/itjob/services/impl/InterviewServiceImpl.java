package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.InterviewRequest;
import com.itjob.dto.InterviewResponse;
import com.itjob.entities.Application;
import com.itjob.entities.Interview;
import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.ApplicationRepo;
import com.itjob.repository.InterviewRepo;
import com.itjob.services.InterviewService;
import com.itjob.services.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepo interviewRepo;
    private final ApplicationRepo applicationRepo;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(String recruiterEmail, UUID applicationId, InterviewRequest request) {
        Application application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Verify the application's job belongs to this recruiter
        if (!application.getJob().getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new ResourceNotFoundException("Application not found or you don't have access");
        }

        // Auto-set status to INTERVIEWING if not already
        if (application.getStatus() != ApplicationStatus.INTERVIEWING) {
            application.setStatus(ApplicationStatus.INTERVIEWING);
            application.setStatusUpdatedAt(LocalDateTime.now());
            applicationRepo.save(application);
        }

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setInterviewMode(request.getInterviewMode());
        interview.setInterviewLink(request.getInterviewLink());
        interview.setNotes(request.getNotes());
        interview.setStatus("SCHEDULED");
        interview.setCreatedAt(LocalDateTime.now());
        interview.setUpdatedAt(LocalDateTime.now());

        interview = interviewRepo.save(interview);

        // Notify candidate about the scheduled interview
        String candidateEmail = interview.getApplication().getCandidate().getEmail();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String companyName = interview.getApplication().getJob().getRecruiter().getCompanyName();
        if (companyName == null) {
            companyName = interview.getApplication().getJob().getRecruiter().getEmail();
        }

        String formattedDate = request.getInterviewDate() != null ? request.getInterviewDate().toString() : "TBD";
        String formattedTime = request.getInterviewTime() != null ? request.getInterviewTime().toString() : "TBD";

        notificationService.createNotification(
                candidateEmail,
                "INTERVIEW",
                "Interview Scheduled",
                "An interview for " + jobTitle + " at " + companyName + " has been scheduled on "
                        + formattedDate + " at " + formattedTime + ".",
                interview.getId().toString(),
                "interview");

        return toResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse rescheduleInterview(String recruiterEmail, UUID interviewId, InterviewRequest request) {
        Interview interview = interviewRepo.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getApplication().getJob().getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new ResourceNotFoundException("Interview not found or you don't have access");
        }

        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setInterviewMode(request.getInterviewMode());
        interview.setInterviewLink(request.getInterviewLink());
        interview.setNotes(request.getNotes());
        interview.setStatus("SCHEDULED");
        interview.setUpdatedAt(LocalDateTime.now());

        interview = interviewRepo.save(interview);

        // Notify candidate about the rescheduled interview
        String candidateEmail = interview.getApplication().getCandidate().getEmail();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String companyName = interview.getApplication().getJob().getRecruiter().getCompanyName();
        if (companyName == null) {
            companyName = interview.getApplication().getJob().getRecruiter().getEmail();
        }

        String formattedDate = request.getInterviewDate() != null ? request.getInterviewDate().toString() : "TBD";
        String formattedTime = request.getInterviewTime() != null ? request.getInterviewTime().toString() : "TBD";

        notificationService.createNotification(
                candidateEmail,
                "INTERVIEW",
                "Interview Rescheduled",
                "Your interview for " + jobTitle + " at " + companyName
                        + " has been rescheduled to " + formattedDate + " at " + formattedTime + ".",
                interview.getId().toString(),
                "interview");

        return toResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse cancelInterview(String recruiterEmail, UUID interviewId) {
        Interview interview = interviewRepo.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getApplication().getJob().getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new ResourceNotFoundException("Interview not found or you don't have access");
        }

        interview.setStatus("CANCELLED");
        interview.setUpdatedAt(LocalDateTime.now());

        interview = interviewRepo.save(interview);

        // Notify candidate about cancellation
        String candidateEmail = interview.getApplication().getCandidate().getEmail();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String companyName = interview.getApplication().getJob().getRecruiter().getCompanyName();
        if (companyName == null) {
            companyName = interview.getApplication().getJob().getRecruiter().getEmail();
        }

        notificationService.createNotification(
                candidateEmail,
                "INTERVIEW",
                "Interview Cancelled",
                "Your interview for " + jobTitle + " at " + companyName + " has been cancelled.",
                interview.getId().toString(),
                "interview");

        return toResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse completeInterview(String recruiterEmail, UUID interviewId) {
        Interview interview = interviewRepo.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getApplication().getJob().getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new ResourceNotFoundException("Interview not found or you don't have access");
        }

        interview.setStatus("COMPLETED");
        interview.setUpdatedAt(LocalDateTime.now());

        interview = interviewRepo.save(interview);
        return toResponse(interview);
    }

    @Override
    public List<InterviewResponse> getUpcomingInterviews(String recruiterEmail) {
        return interviewRepo.findUpcomingByRecruiterEmail(recruiterEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<InterviewResponse> getAllInterviews(String recruiterEmail) {
        return interviewRepo.findByRecruiterEmailOrderByDateDesc(recruiterEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<InterviewResponse> getInterviewsForApplication(UUID applicationId) {
        return interviewRepo.findByApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public InterviewResponse getInterviewById(String recruiterEmail, UUID interviewId) {
        Interview interview = interviewRepo.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getApplication().getJob().getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new ResourceNotFoundException("Interview not found or you don't have access");
        }

        return toResponse(interview);
    }

    @Override
    public List<InterviewResponse> getCandidateInterviews(String candidateEmail) {
        return interviewRepo.findByCandidateEmail(candidateEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<InterviewResponse> getCandidateUpcomingInterviews(String candidateEmail) {
        return interviewRepo.findUpcomingByCandidateEmail(candidateEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private InterviewResponse toResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .jobId(interview.getApplication().getJob().getId())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .candidateId(interview.getApplication().getCandidate().getId())
                .fullName(interview.getApplication().getCandidate().getFullName())
                .email(interview.getApplication().getCandidate().getEmail())
                .interviewDate(interview.getInterviewDate())
                .interviewTime(interview.getInterviewTime())
                .interviewMode(interview.getInterviewMode())
                .interviewLink(interview.getInterviewLink())
                .notes(interview.getNotes())
                .companyName(interview.getApplication().getJob().getRecruiter().getCompanyName())
                .status(interview.getStatus())
                .createdAt(interview.getCreatedAt())
                .updatedAt(interview.getUpdatedAt())
                .build();
    }
}
