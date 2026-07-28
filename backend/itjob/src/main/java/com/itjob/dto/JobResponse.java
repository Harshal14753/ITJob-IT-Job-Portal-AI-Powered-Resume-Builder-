package com.itjob.dto;

import java.util.List;
import java.util.UUID;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobResponse {

    private UUID id;

    private String title;

    private String description;

    private String location;

    private Integer salaryMin;

    private Integer salaryMax;

    private String websiteLink;

    private Integer vacancy;

    private JobType jobType;

    private Integer minExperience;

    private List<String> benefits;

    private List<String> skills;

    private List<Long> skillIds;

    private WorkLocation workLocation;

    // Recruiter dashboard purpose
    private Integer totalApplications;

    // Recruiter information for candidate side
    private UUID recruiterId;

    private String companyName;

    // Whether the current candidate has already applied to this job
    private boolean hasApplied;

    // Computed status: DRAFT, ACTIVE, CLOSED, PENDING_APPROVAL
    private String status;

    // AI match score for candidate (0-100)
    private Integer matchScore;
}
