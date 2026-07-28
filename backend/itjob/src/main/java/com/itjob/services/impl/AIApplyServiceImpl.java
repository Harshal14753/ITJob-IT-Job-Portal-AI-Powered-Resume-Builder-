package com.itjob.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.itjob.dto.AIApplySettingsRequest;
import com.itjob.dto.AIApplySettingsResponse;
import com.itjob.dto.JobResponse;
import com.itjob.entities.AIApplySettings;
import com.itjob.entities.Application;
import com.itjob.entities.Candidate;
import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Job;
import com.itjob.entities.Skills;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.mapper.JobMapper;
import com.itjob.repository.AIApplySettingsRepo;
import com.itjob.repository.ApplicationRepo;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.JobRepo;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.services.AIApplyService;
import com.itjob.services.JobService;
import com.itjob.services.MatchService;
import com.itjob.services.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AIApplyServiceImpl implements AIApplyService {

    private final AIApplySettingsRepo settingsRepo;
    private final CandidateRepo candidateRepo;
    private final JobRepo jobRepo;
    private final ApplicationRepo applicationRepo;
    private final SystemConfigRepo systemConfigRepo;
    private final MatchService matchService;
    private final NotificationService notificationService;
    private final JobMapper jobMapper;
    private final JobService jobService;

    @Override
    public AIApplySettingsResponse getSettings(String candidateEmail) {
        AIApplySettings settings = settingsRepo.findByCandidateEmail(candidateEmail)
                .orElse(null);

        if (settings == null) {
            return AIApplySettingsResponse.builder()
                    .enabled(false)
                    .matchThreshold(80)
                    .scheduleTime("09:00")
                    .totalAutoApplied(0)
                    .build();
        }

        return toResponse(settings);
    }

    private boolean passesPreferenceFilters(AIApplySettings settings, Job job) {
        if (settings == null) return true;

        // Preferred titles match (if set)
        if (settings.getPreferredTitles() != null && !settings.getPreferredTitles().isBlank()) {
            String[] titles = settings.getPreferredTitles().toLowerCase().split(",");
            boolean match = false;
            String jobTitleLower = job.getTitle().toLowerCase();
            for (String title : titles) {
                String trimmed = title.trim();
                if (!trimmed.isEmpty() && jobTitleLower.contains(trimmed)) {
                    match = true;
                    break;
                }
            }
            if (!match) return false;
        }

        // Preferred location match (if set)
        if (settings.getPreferredLocation() != null && !settings.getPreferredLocation().isBlank()) {
            if (job.getLocation() == null) return false;
            String prefLoc = settings.getPreferredLocation().toLowerCase().trim();
            String jobLoc = job.getLocation().toLowerCase().trim();
            if (!jobLoc.contains(prefLoc) && !prefLoc.contains(jobLoc)) {
                return false;
            }
        }

        // Preferred job type match (if set)
        if (settings.getPreferredJobType() != null && !settings.getPreferredJobType().isBlank()) {
            if (job.getJobType() == null) return false;
            if (!job.getJobType().name().equalsIgnoreCase(settings.getPreferredJobType().trim())) {
                return false;
            }
        }

        // Preferred work location match (if set)
        if (settings.getPreferredWorkLocation() != null && !settings.getPreferredWorkLocation().isBlank()) {
            if (job.getWorkLocation() == null) return false;
            if (!job.getWorkLocation().name().equalsIgnoreCase(settings.getPreferredWorkLocation().trim())) {
                return false;
            }
        }

        // Preferred min salary (job's max salary should be at least this amount)
        if (settings.getPreferredMinSalary() != null && settings.getPreferredMinSalary() > 0) {
            if (job.getSalaryMax() == null) return false;
            if (job.getSalaryMax() < settings.getPreferredMinSalary()) {
                return false;
            }
        }

        // Preferred min experience (job's min experience should be <= candidate's preferred)
        // If the job has no min_experience requirement, it's open to all experience levels
        if (settings.getPreferredMinExperience() != null && settings.getPreferredMinExperience() > 0) {
            if (job.getMinExperience() != null && job.getMinExperience() > settings.getPreferredMinExperience()) {
                return false;
            }
        }

        // Preferred skills match (job must have at least one of the preferred skills)
        if (settings.getPreferredSkills() != null && !settings.getPreferredSkills().isBlank()) {
            String[] prefSkills = settings.getPreferredSkills().toLowerCase().split(",");
            if (job.getSkills() == null || job.getSkills().isEmpty()) return false;
            boolean match = false;
            for (Skills jobSkill : job.getSkills()) {
                String jobSkillName = jobSkill.getSkillName().toLowerCase().trim();
                for (String prefSkill : prefSkills) {
                    if (jobSkillName.contains(prefSkill.trim())) {
                        match = true;
                        break;
                    }
                }
                if (match) break;
            }
            if (!match) return false;
        }

        return true;
    }

    @Override
    @Transactional
    public AIApplySettingsResponse saveSettings(String candidateEmail, AIApplySettingsRequest request) {
        Candidate candidate = candidateRepo.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        AIApplySettings settings = settingsRepo.findByCandidateEmail(candidateEmail)
                .orElse(null);

        if (settings == null) {
            settings = new AIApplySettings();
            settings.setCandidate(candidate);
            settings.setCreatedAt(LocalDateTime.now());
        }

        settings.setEnabled(request.isEnabled());
        settings.setMatchThreshold(request.getMatchThreshold());

        if (request.getScheduleTime() != null && !request.getScheduleTime().isEmpty()) {
            settings.setScheduleTime(LocalTime.parse(request.getScheduleTime(), DateTimeFormatter.ofPattern("HH:mm")));
        }

        // Save preference criteria
        settings.setPreferredSkills(request.getPreferredSkills());
        settings.setPreferredLocation(request.getPreferredLocation());
        settings.setPreferredJobType(request.getPreferredJobType());
        settings.setPreferredMinSalary(request.getPreferredMinSalary());
        settings.setPreferredWorkLocation(request.getPreferredWorkLocation());
        settings.setPreferredTitles(request.getPreferredTitles());
        settings.setPreferredMinExperience(request.getPreferredMinExperience());

        settings.setUpdatedAt(LocalDateTime.now());
        settingsRepo.save(settings);

        return toResponse(settings);
    }

    @Override
    public List<JobResponse> getReviewJobs(String candidateEmail) {
        Candidate candidate = candidateRepo.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        AIApplySettings settings = settingsRepo.findByCandidateEmail(candidateEmail)
                .orElse(null);

        // Get all active, approved, non-expired jobs
        List<Job> activeJobs = jobRepo.findActiveApprovedJobs(LocalDateTime.now());

        List<JobResponse> results = activeJobs.stream()
                // Skip if already applied
                .filter(job -> !applicationRepo.existsByCandidateAndJob(candidate, job))
                // Apply preference-based filtering
                .filter(job -> passesPreferenceFilters(settings, job))
                // Compute match score — only scores the attributes the candidate set as preferences
                .map(job -> {
                    int matchScore = matchService.computeMatchScore(candidate, job, settings);
                    JobResponse dto = jobMapper.toDto(job);
                    dto.setMatchScore(matchScore);
                    return dto;
                })
                // Sort by match score descending (highest first)
                .sorted(Comparator.comparingInt(JobResponse::getMatchScore).reversed())
                .toList();

        return results;
    }

    @Override
    @Transactional
    public void applyToJob(UUID jobId, String candidateEmail) {
        // Delegate to JobService which handles all validation and creation
        jobService.applyForJob(jobId, candidateEmail);
    }

    @Override
    @Transactional
    public int runAutoApply(String candidateEmail) {
        // Check if AI auto-apply is globally enabled
        boolean globallyEnabled = systemConfigRepo.findByConfigKey("ai_auto_apply_enabled")
                .map(c -> "true".equalsIgnoreCase(c.getConfigValue()))
                .orElse(true); // Default to enabled if config not found

        if (!globallyEnabled) {
            return 0;
        }

        Candidate candidate = candidateRepo.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        AIApplySettings settings = settingsRepo.findByCandidateEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("AI Apply settings not found. Save settings first."));

        if (!settings.isEnabled()) {
            return 0;
        }

        int threshold = settings.getMatchThreshold();

        // Get all active, approved, non-expired jobs
        List<Job> activeJobs = jobRepo.findActiveApprovedJobs(LocalDateTime.now());

        int appliedCount = 0;

        for (Job job : activeJobs) {
            // Skip if already applied
            if (applicationRepo.existsByCandidateAndJob(candidate, job)) {
                continue;
            }

            // Apply preference-based filtering — skip jobs that don't match the candidate's stated preferences
            if (!passesPreferenceFilters(settings, job)) {
                continue;
            }

            // Compute match score — only scores the attributes the candidate set as preferences
            int matchScore = matchService.computeMatchScore(candidate, job, settings);

            if (matchScore >= threshold) {
                Application application = new Application();
                application.setApplicationDate(LocalDate.now());
                application.setStatus(ApplicationStatus.PENDING);
                application.setStatusUpdatedAt(LocalDateTime.now());
                application.setCandidate(candidate);
                application.setJob(job);
                application.setAutoApplied(true);
                applicationRepo.save(application);

                // Notify the candidate about the auto-apply
                String companyName = job.getRecruiter().getCompanyName();
                if (companyName == null) {
                    companyName = job.getRecruiter().getEmail();
                }

                notificationService.createNotification(
                        candidateEmail,
                        "APPLICATION_STATUS",
                        "AI Auto-Applied",
                        "You have been auto-applied to \"" + job.getTitle() + "\" at " +
                                companyName +
                                " (Match: " + matchScore + "%).",
                        application.getId().toString(),
                        "application");

                appliedCount++;
            }
        }

        // Update last run timestamp
        settings.setLastRunAt(LocalDateTime.now());
        settingsRepo.save(settings);

        return appliedCount;
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void processScheduledAutoApply() {
        LocalTime now = LocalTime.now();
        // Only process candidates whose last run was before today (or never)
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        List<AIApplySettings> readySettings = settingsRepo.findSettingsReadyToRun(now, todayStart);

        for (AIApplySettings settings : readySettings) {
            try {
                runAutoApply(settings.getCandidate().getEmail());
            } catch (Exception e) {
                // Log error for individual candidate but continue processing others
                System.err.println("Auto-apply failed for candidate " +
                        settings.getCandidate().getEmail() + ": " + e.getMessage());
            }
        }
    }

    private AIApplySettingsResponse toResponse(AIApplySettings settings) {
        // Count only auto-applied applications
        int totalAutoApplied = 0;
        try {
            totalAutoApplied = applicationRepo.findByCandidateEmail(settings.getCandidate().getEmail())
                    .stream()
                    .filter(Application::isAutoApplied)
                    .toList()
                    .size();
        } catch (Exception ignored) {}

        String scheduleTimeStr = settings.getScheduleTime() != null
                ? settings.getScheduleTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                : "09:00";

        return AIApplySettingsResponse.builder()
                .id(settings.getId())
                .enabled(settings.isEnabled())
                .matchThreshold(settings.getMatchThreshold())
                .scheduleTime(scheduleTimeStr)
                .lastRunAt(settings.getLastRunAt())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .totalAutoApplied(totalAutoApplied)
                .preferredSkills(settings.getPreferredSkills())
                .preferredLocation(settings.getPreferredLocation())
                .preferredJobType(settings.getPreferredJobType())
                .preferredMinSalary(settings.getPreferredMinSalary())
                .preferredWorkLocation(settings.getPreferredWorkLocation())
                .preferredTitles(settings.getPreferredTitles())
                .preferredMinExperience(settings.getPreferredMinExperience())
                .build();
    }
}
