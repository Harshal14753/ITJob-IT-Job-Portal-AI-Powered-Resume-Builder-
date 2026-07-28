package com.itjob.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    private String phoneNo;

    private String address;

    private String githubLink;

    private String linkedInLink;

    private String portfolioLink;

    private String about;

    private List<Long> skillIds;

    private String resumeUrl;

    // Optional nested entity data
    private List<ExperienceItem> experiences;
    private List<EducationItem> educations;
    private List<ProjectItem> projects;
    private List<CertificateItem> certificates;

    @Data
    public static class ExperienceItem {
        private String jobRole;
        private String jobType;
        private String companyName;
        private String location;
        private String startDate;
        private String endDate;
        private String description;
        private boolean currentlyWorking;
    }

    @Data
    public static class EducationItem {
        private String institutionName;
        private String degree;
        private String fieldOfStudy;
        private String cgpa;
        private String percentage;
        private String startDate;
        private String endDate;
        private boolean currentlyPursuing;
    }

    @Data
    public static class ProjectItem {
        private String title;
        private String description;
        private String websiteLink;
        private String startDate;
        private String endDate;
        private boolean currentlyWorking;
    }

    @Data
    public static class CertificateItem {
        private String certificateName;
        private String issuingOrganization;
        private String issueDate;
        private String credentialId;
        private String credentialUrl;
        private String description;
    }
}
