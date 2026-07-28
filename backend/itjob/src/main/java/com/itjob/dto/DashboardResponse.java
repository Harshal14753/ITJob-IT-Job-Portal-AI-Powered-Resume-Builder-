package com.itjob.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {

    // Stats
    private long totalJobsPosted;
    private long totalApplications;
    private long shortlistedCount;
    private long interviewingCount;
    private long acceptedCount;
    private long rejectedCount;

    // Recent jobs
    private List<RecentJob> recentJobs;

    // Recent applicants
    private List<RecentApplicant> recentApplicants;

    // Upcoming interviews
    private List<UpcomingInterview> upcomingInterviews;

    @Data
    @Builder
    public static class RecentJob {
        private UUID id;
        private String title;
        private String location;
        private JobType jobType;
        private WorkLocation workLocation;
        private int totalApplicants;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class RecentApplicant {
        private UUID applicationId;
        private UUID jobId;
        private String jobTitle;
        private String fullName;
        private String email;
        private ApplicationStatus status;
        private LocalDate applicationDate;
    }

    @Data
    @Builder
    public static class UpcomingInterview {
        private UUID applicationId;
        private UUID jobId;
        private String jobTitle;
        private String fullName;
        private String email;
        private LocalDateTime statusUpdatedAt;
    }
}
