package com.itjob.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIApplySettingsResponse {

    private String id;
    private boolean enabled;
    private int matchThreshold;
    private String scheduleTime; // HH:mm format
    private LocalDateTime lastRunAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int totalAutoApplied; // total jobs auto-applied so far

    // === Preference Criteria ===

    private String preferredSkills;        // comma-separated skill names
    private String preferredLocation;
    private String preferredJobType;
    private Integer preferredMinSalary;
    private String preferredWorkLocation;
    private String preferredTitles;        // comma-separated job titles
    private Integer preferredMinExperience;
}
