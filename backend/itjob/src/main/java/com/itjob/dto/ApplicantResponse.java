package com.itjob.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.itjob.entities.Certificate;
import com.itjob.entities.Education;
import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Experience;
import com.itjob.entities.Project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicantResponse {

    private UUID applicationId;

    private LocalDate applicationDate;

    private ApplicationStatus status;

    private LocalDateTime statusUpdatedAt;

    // Candidate details
    private UUID candidateId;

    private String fullName;

    private String email;

    private String phoneNo;

    private String address;

    private String githubLink;

    private String linkedInLink;

    private String portfolioLink;

    private String about;

    private String resumeUrl;

    private String resumePublicId;

    private Set<String> skills;

    private Set<Long> skillIds;

    // Latest experience (optional, for quick preview)
    private String latestExperienceTitle;

    private String latestExperienceCompany;

    // Full profile details (populated only for single-applicant fetch)
    @JsonIgnoreProperties({"candidate"})
    private List<Experience> experiences;

    @JsonIgnoreProperties({"candidate"})
    private List<Education> educations;

    @JsonIgnoreProperties({"candidate"})
    private List<Project> projects;

    @JsonIgnoreProperties({"candidate"})
    private List<Certificate> certificates;
}
