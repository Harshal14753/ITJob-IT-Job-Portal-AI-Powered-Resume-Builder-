package com.itjob.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.itjob.entities.Job;
import com.itjob.entities.SystemConfig;
import com.itjob.repository.JobRepo;
import com.itjob.repository.SystemConfigRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobScheduler {

    private final JobRepo jobRepo;
    private final SystemConfigRepo systemConfigRepo;

    /**
     * Runs every hour to check for expired jobs and auto-close them
     * if the job_auto_close_expired setting is enabled.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void autoCloseExpiredJobs() {
        boolean autoCloseEnabled = systemConfigRepo.findByConfigKey("job_auto_close_expired")
                .map(SystemConfig::getConfigValue)
                .map(Boolean::parseBoolean)
                .orElse(true);

        if (!autoCloseEnabled) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<Job> expiredJobs = jobRepo.findExpiredActiveJobs(now);

        for (Job job : expiredJobs) {
            job.setActive(false);
            jobRepo.save(job);
            log.info("Auto-closed expired job: {} (recruiter: {})",
                    job.getTitle(), job.getRecruiter().getEmail());
        }

        if (!expiredJobs.isEmpty()) {
            log.info("Auto-closed {} expired job(s)", expiredJobs.size());
        }
    }
}
