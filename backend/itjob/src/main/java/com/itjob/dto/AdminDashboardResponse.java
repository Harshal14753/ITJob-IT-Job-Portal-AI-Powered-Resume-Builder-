package com.itjob.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalJobs;
    private long totalApplications;
    private long totalContacts;
    private long pendingContacts;
    private long totalCategories;
    private long totalSkills;

    // Recent signups (last 7 days)
    private long newUsersThisWeek;

    // Active jobs vs closed jobs
    private long activeJobs;
    private long closedJobs;
    private long pendingJobs;
    private long featuredJobs;

    // AI Auto-Apply stats
    private long totalAutoAppliedJobs;    // total applications made via AI auto-apply
    private long activeAutoApplyUsers;    // candidates with AI auto-apply enabled
}
