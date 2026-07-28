package com.itjob.services;

import com.itjob.entities.AIApplySettings;
import com.itjob.entities.Candidate;
import com.itjob.entities.Job;

public interface MatchService {

    /**
     * Compute a match score (0-100) between a candidate and a job based on:
     * - Skills overlap (40%)
     * - Experience fit (25%)
     * - Location match (15%)
     * - Salary range fit (10%)
     * - Job type match (10%)
     * 
     * Uses default weighting — all categories equally considered.
     */
    int computeMatchScore(Candidate candidate, Job job);

    /**
     * Compute a match score (0-100) that considers ONLY the preference attributes
     * the candidate has explicitly set in their AIApplySettings.
     *
     * Each set preference gets EQUAL weight. For example:
     * - Only preferredTitles set → Title check = 100% of score
     * - preferredTitles + preferredLocation set → each = 50%
     * - No preferences set → falls back to default computeMatchScore(Candidate, Job)
     */
    int computeMatchScore(Candidate candidate, Job job, AIApplySettings settings);
}
