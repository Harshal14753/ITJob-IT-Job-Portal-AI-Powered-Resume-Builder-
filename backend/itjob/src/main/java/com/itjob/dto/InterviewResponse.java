package com.itjob.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InterviewResponse {
    private UUID id;
    private UUID applicationId;
    private UUID jobId;
    private String jobTitle;
    private UUID candidateId;
    private String fullName;
    private String email;
    private LocalDate interviewDate;
    private LocalTime interviewTime;
    private String interviewMode;
    private String interviewLink;
    private String notes;
    private String companyName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
