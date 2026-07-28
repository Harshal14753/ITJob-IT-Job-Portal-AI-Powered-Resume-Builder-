package com.itjob.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationResponse {

    private UUID id;

    private LocalDate applicationDate;

    private ApplicationStatus status;

    private LocalDateTime statusUpdatedAt;

    // Job details
    private UUID jobId;

    private String jobTitle;

    private String jobLocation;

    private JobType jobType;

    private WorkLocation workLocation;

    private Integer salaryMin;

    private Integer salaryMax;

    // Company details
    private String companyName;
}
