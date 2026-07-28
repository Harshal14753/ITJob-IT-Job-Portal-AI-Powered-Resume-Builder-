package com.itjob.services;

import java.util.List;
import java.util.UUID;

import com.itjob.dto.InterviewRequest;
import com.itjob.dto.InterviewResponse;

public interface InterviewService {

    InterviewResponse scheduleInterview(String recruiterEmail, UUID applicationId, InterviewRequest request);

    InterviewResponse rescheduleInterview(String recruiterEmail, UUID interviewId, InterviewRequest request);

    InterviewResponse cancelInterview(String recruiterEmail, UUID interviewId);

    InterviewResponse completeInterview(String recruiterEmail, UUID interviewId);

    List<InterviewResponse> getUpcomingInterviews(String recruiterEmail);

    List<InterviewResponse> getAllInterviews(String recruiterEmail);

    List<InterviewResponse> getInterviewsForApplication(UUID applicationId);

    InterviewResponse getInterviewById(String recruiterEmail, UUID interviewId);

    // Candidate-side
    List<InterviewResponse> getCandidateInterviews(String candidateEmail);

    List<InterviewResponse> getCandidateUpcomingInterviews(String candidateEmail);
}
