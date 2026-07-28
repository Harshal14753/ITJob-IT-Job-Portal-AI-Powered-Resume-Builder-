package com.itjob.services;

import java.util.List;
import java.util.UUID;

import com.itjob.dto.AIApplySettingsRequest;
import com.itjob.dto.AIApplySettingsResponse;
import com.itjob.dto.JobResponse;

public interface AIApplyService {

    /**
     * Get the current AI apply settings for a candidate.
     */
    AIApplySettingsResponse getSettings(String candidateEmail);

    /**
     * Save or update the AI apply settings for a candidate.
     */
    AIApplySettingsResponse saveSettings(String candidateEmail, AIApplySettingsRequest request);

    /**
     * Get all jobs matching the candidate's preferences, with match scores.
     * Excludes jobs the candidate has already applied to.
     * Returns jobs sorted by match score descending.
     */
    List<JobResponse> getReviewJobs(String candidateEmail);

    /**
     * Apply to a specific job from the review page.
     */
    void applyToJob(UUID jobId, String candidateEmail);

    /**
     * Run the auto-apply logic for the given candidate.
     * Finds all jobs with matchScore >= threshold and applies.
     * Returns the number of jobs applied to.
     */
    int runAutoApply(String candidateEmail);

    /**
     * Scheduled method that processes all candidates with enabled AI apply
     * whose schedule time has passed since their last run.
     */
    void processScheduledAutoApply();
}
