package com.itjob.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminJobResponse {
    private UUID id;
    private String title;
    private String companyName;
    private String location;
    private JobType jobType;
    private WorkLocation workLocation;
    private Integer salaryMin;
    private Integer salaryMax;
    private int totalApplicants;
    private String status;
    private String recruiterEmail;
    private List<String> skills;
    private LocalDateTime createdAt;

    // Job settings fields
    private boolean approved;
    private boolean featured;
    private boolean active;
    private LocalDateTime expiresAt;
    private LocalDateTime featuredUntil;
}
