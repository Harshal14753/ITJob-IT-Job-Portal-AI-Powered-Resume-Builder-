package com.itjob.services.impl;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.itjob.entities.AIApplySettings;
import com.itjob.entities.Candidate;
import com.itjob.entities.Experience;
import com.itjob.entities.Job;
import com.itjob.entities.Skills;
import com.itjob.services.MatchService;

@Service
public class MatchServiceImpl implements MatchService {

    // ─────────────────────────────────────────────────────────────
    // Default scoring (used when no AIApplySettings are available)
    // ─────────────────────────────────────────────────────────────

    @Override
    public int computeMatchScore(Candidate candidate, Job job) {
        if (candidate == null || job == null) {
            return 0;
        }

        double totalScore = 0;

        // 1. Skills match (40% weight)
        totalScore += computeSkillsScore(candidate, job) * 0.40;

        // 2. Experience match (25% weight)
        totalScore += computeExperienceScore(candidate, job) * 0.25;

        // 3. Location match (15% weight)
        totalScore += computeLocationScore(candidate, job) * 0.15;

        // 4. Salary match (10% weight)
        totalScore += computeSalaryScore(candidate, job) * 0.10;

        // 5. Job type match (10% weight)
        totalScore += computeJobTypeScore(job) * 0.10;

        // Return as integer percentage, capped at 100
        return Math.min((int) Math.round(totalScore), 100);
    }

    // ──────────────────────────────────────────────────────────────
    // Preference-based scoring — only scores the attributes the
    // candidate explicitly set in their AIApplySettings.
    // Each set attribute gets EQUAL weight.
    // ──────────────────────────────────────────────────────────────

    @Override
    public int computeMatchScore(Candidate candidate, Job job, AIApplySettings settings) {
        if (candidate == null || job == null) {
            return 0;
        }

        if (settings == null) {
            return computeMatchScore(candidate, job); // fallback to default
        }

        // Determine which preference fields are actually set (non-blank / non-null / > 0)
        Map<String, Boolean> activePrefs = new LinkedHashMap<>();
        activePrefs.put("title",
                settings.getPreferredTitles() != null && !settings.getPreferredTitles().isBlank());
        activePrefs.put("skills",
                settings.getPreferredSkills() != null && !settings.getPreferredSkills().isBlank());
        activePrefs.put("location",
                settings.getPreferredLocation() != null && !settings.getPreferredLocation().isBlank());
        activePrefs.put("jobType",
                settings.getPreferredJobType() != null && !settings.getPreferredJobType().isBlank());
        activePrefs.put("workLocation",
                settings.getPreferredWorkLocation() != null && !settings.getPreferredWorkLocation().isBlank());
        activePrefs.put("salary",
                settings.getPreferredMinSalary() != null && settings.getPreferredMinSalary() > 0);
        activePrefs.put("experience",
                settings.getPreferredMinExperience() != null && settings.getPreferredMinExperience() > 0);

        long activeCount = activePrefs.values().stream().filter(v -> v).count();

        // No preferences set → fall back to default scoring
        if (activeCount == 0) {
            return computeMatchScore(candidate, job);
        }

        double weight = 1.0 / activeCount; // each attribute gets equal weight
        double totalScore = 0;

        if (activePrefs.get("title")) {
            totalScore += computeTitleScore(job, settings.getPreferredTitles()) * weight;
        }
        if (activePrefs.get("skills")) {
            totalScore += computeSkillsScoreFromPrefs(job, settings.getPreferredSkills()) * weight;
        }
        if (activePrefs.get("location")) {
            totalScore += computeLocationScoreFromPref(job, settings.getPreferredLocation()) * weight;
        }
        if (activePrefs.get("jobType")) {
            totalScore += computeJobTypeScoreFromPref(job, settings.getPreferredJobType()) * weight;
        }
        if (activePrefs.get("workLocation")) {
            totalScore += computeWorkLocationScoreFromPref(job, settings.getPreferredWorkLocation()) * weight;
        }
        if (activePrefs.get("salary")) {
            totalScore += computeSalaryScoreFromPref(job, settings.getPreferredMinSalary()) * weight;
        }
        if (activePrefs.get("experience")) {
            totalScore += computeExperienceScoreFromPref(job, settings.getPreferredMinExperience()) * weight;
        }

        return Math.min((int) Math.round(totalScore), 100);
    }

    // =====================================================================
    //  Preference-based scoring helpers (each returns 0–100)
    // =====================================================================

    /**
     * Title match: does any preferred title appear inside the job title?
     * Returns 100 for a match, 0 otherwise.
     */
    private double computeTitleScore(Job job, String preferredTitles) {
        if (preferredTitles == null || preferredTitles.isBlank()) return 0;
        String[] titles = preferredTitles.toLowerCase().split(",");
        String jobTitleLower = job.getTitle().toLowerCase();
        for (String title : titles) {
            if (!title.trim().isEmpty() && jobTitleLower.contains(title.trim())) {
                return 100;
            }
        }
        return 0;
    }

    /**
     * Skills match (preference-based): what % of the candidate's preferred
     * skills exist on the job?
     */
    private double computeSkillsScoreFromPrefs(Job job, String preferredSkills) {
        if (preferredSkills == null || preferredSkills.isBlank()) return 0;
        String[] prefSkills = preferredSkills.toLowerCase().split(",");
        if (job.getSkills() == null || job.getSkills().isEmpty()) return 0;

        Set<String> jobSkillNames = job.getSkills().stream()
                .map(s -> s.getSkillName().toLowerCase().trim())
                .collect(Collectors.toSet());

        long matchCount = 0;
        for (String prefSkill : prefSkills) {
            String trimmed = prefSkill.trim();
            if (!trimmed.isEmpty() && jobSkillNames.contains(trimmed)) {
                matchCount++;
            }
        }

        return (double) matchCount / prefSkills.length * 100;
    }

    /**
     * Location match (preference-based): 100 if the job location contains
     * (or is contained by) the preferred location, 0 otherwise.
     */
    private double computeLocationScoreFromPref(Job job, String preferredLocation) {
        if (preferredLocation == null || preferredLocation.isBlank()) return 0;
        String prefLoc = preferredLocation.toLowerCase().trim();
        String jobLoc = job.getLocation();
        if (jobLoc == null) return 0;
        String jobLocLower = jobLoc.toLowerCase().trim();
        return (jobLocLower.contains(prefLoc) || prefLoc.contains(jobLocLower)) ? 100 : 0;
    }

    /**
     * Job-type match (preference-based): 100 if the job's type equals the
     * preferred type, 0 otherwise.
     */
    private double computeJobTypeScoreFromPref(Job job, String preferredJobType) {
        if (preferredJobType == null || preferredJobType.isBlank()) return 0;
        if (job.getJobType() == null) return 0;
        return job.getJobType().name().equalsIgnoreCase(preferredJobType.trim()) ? 100 : 0;
    }

    /**
     * Work-location match (preference-based): 100 if the job's work location
     * equals the preferred work location, 0 otherwise.
     */
    private double computeWorkLocationScoreFromPref(Job job, String preferredWorkLocation) {
        if (preferredWorkLocation == null || preferredWorkLocation.isBlank()) return 0;
        if (job.getWorkLocation() == null) return 0;
        return job.getWorkLocation().name().equalsIgnoreCase(preferredWorkLocation.trim()) ? 100 : 0;
    }

    /**
     * Salary match (preference-based): 100 if the job's max salary is at
     * or above the candidate's minimum expected salary, proportional otherwise.
     */
    private double computeSalaryScoreFromPref(Job job, Integer preferredMinSalary) {
        if (preferredMinSalary == null || preferredMinSalary <= 0) return 0;
        if (job.getSalaryMax() == null) return 0;
        if (job.getSalaryMax() >= preferredMinSalary) return 100;
        return (double) job.getSalaryMax() / preferredMinSalary * 100;
    }

    /**
     * Experience match (preference-based): 100 if the job requires less or
     * equal experience than the candidate has, proportional otherwise.
     * If the job has no min_experience requirement → 100 (open to all).
     */
    private double computeExperienceScoreFromPref(Job job, Integer preferredMinExperience) {
        if (preferredMinExperience == null || preferredMinExperience <= 0) return 0;
        if (job.getMinExperience() == null) return 100; // no requirement
        if (job.getMinExperience() <= preferredMinExperience) return 100;
        return (double) preferredMinExperience / job.getMinExperience() * 100;
    }

    // =====================================================================
    //  Default scoring helpers (original logic, unchanged)
    // =====================================================================

    /**
     * Skills match: percentage of job skills that the candidate has.
     * Score = (matching skills / job skills count) * 100
     * If job has no skills, return 50 (neutral).
     */
    private double computeSkillsScore(Candidate candidate, Job job) {
        Set<String> jobSkillNames = job.getSkills() != null
                ? job.getSkills().stream()
                        .map(Skills::getSkillName)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet())
                : Set.of();

        Set<String> candidateSkillNames = candidate.getSkills() != null
                ? candidate.getSkills().stream()
                        .map(Skills::getSkillName)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet())
                : Set.of();

        if (jobSkillNames.isEmpty()) {
            return 50; // Neutral score when no skills listed
        }

        if (candidateSkillNames.isEmpty()) {
            return 0;
        }

        long matchingSkills = jobSkillNames.stream()
                .filter(candidateSkillNames::contains)
                .count();

        return (double) matchingSkills / jobSkillNames.size() * 100;
    }

    /**
     * Experience match: compare candidate's total years of experience
     * against the job's minimum requirement.
     * - If candidate has >= required experience: 100
     * - If candidate has less: proportional score
     * - If job has no min requirement: 75 (likely entry-level friendly)
     */
    private double computeExperienceScore(Candidate candidate, Job job) {
        Integer requiredExp = job.getMinExperience();

        // Calculate candidate's total years from their experiences
        double candidateYears = 0;
        if (candidate.getExperiences() != null) {
            for (Experience exp : candidate.getExperiences()) {
                if (exp.getStartDate() != null && exp.getEndDate() != null) {
                    candidateYears += exp.getEndDate().getYear() - exp.getStartDate().getYear();
                } else if (exp.getStartDate() != null && exp.isCurrentlyWorking()) {
                    candidateYears += java.time.LocalDate.now().getYear() - exp.getStartDate().getYear();
                }
            }
        }

        if (requiredExp == null || requiredExp <= 0) {
            return 75; // No requirement — assume friendly to all levels
        }

        if (candidateYears >= requiredExp) {
            return 100;
        }

        if (candidateYears <= 0) {
            return 20; // No experience listed but job requires some
        }

        return (candidateYears / requiredExp) * 100;
    }

    /**
     * Location match: check if candidate's address contains the job location or vice versa.
     * - Exact or partial match: 100
     * - No match but both exist: 30
     * - One or both missing: 50 (neutral)
     */
    private double computeLocationScore(Candidate candidate, Job job) {
        String candidateLoc = candidate.getAddress();
        String jobLoc = job.getLocation();

        if (candidateLoc == null || jobLoc == null) {
            return 50; // Neutral
        }

        String cl = candidateLoc.toLowerCase().trim();
        String jl = jobLoc.toLowerCase().trim();

        if (cl.equals(jl) || cl.contains(jl) || jl.contains(cl)) {
            return 100;
        }

        return 30; // Different locations
    }

    /**
     * Salary match: compare candidate's expected salary (from latest experience or default)
     * against job's salary range.
     * Since we don't have an expected salary field on the candidate,
     * we use a neutral score here unless there's data.
     * - If candidate's salary expectation is within range: 100
     * - If below minimum but close: proportional
     * - Default: 60 (neutral)
     */
    private double computeSalaryScore(Candidate candidate, Job job) {
        Integer salaryMin = job.getSalaryMin();
        Integer salaryMax = job.getSalaryMax();

        if (salaryMin == null && salaryMax == null) {
            return 60; // No salary info — neutral
        }

        // We don't have candidate's expected salary stored, so use a neutral score
        // This can be enhanced later when we add expected salary to candidate profile
        return 65;
    }

    /**
     * Job type match: compare candidate's latest experience job type vs job's type.
     * Since we may not have a preferred job type on the candidate,
     * we use a neutral high score for now.
     */
    private double computeJobTypeScore(Job job) {
        // No preferred job type stored on candidate yet
        // Return neutral high score
        return 70;
    }
}
