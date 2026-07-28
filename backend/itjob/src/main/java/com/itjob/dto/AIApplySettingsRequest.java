package com.itjob.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIApplySettingsRequest {

    private boolean enabled;

    @Builder.Default
    private int matchThreshold = 80;

    private String scheduleTime; // HH:mm format, e.g. "09:00"

    // === Preference Criteria ===

    private String preferredSkills;      // comma-separated skill names
    private String preferredLocation;     // city / region
    private String preferredJobType;      // FULL_TIME, PART_TIME, etc.
    private Integer preferredMinSalary;   // minimum expected salary
    private String preferredWorkLocation; // REMOTE, ON_SITE, HYBRID
    private String preferredTitles;       // comma-separated job titles
    private Integer preferredMinExperience; // minimum years of experience
}
