package com.itjob.dto;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.Role;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CandidateProfileResponse implements ProfileResponse {

    private String email;
    private Role role;

    private String fullName;

    private String address;

    private String phoneNo;

    private String githubLink;

    private String linkedInLink;

    private String portfolioLink;

    private String about;

    private String resumeUrl;
    private String resumePublicId;

    private boolean profileCompleted;

    private Set<String> skills = new HashSet<>();

    private Set<Long> skillIds = new HashSet<>();

    private List<ExperienceDTO> experiences;
    private List<ProjectDTO> projects;
    private List<EducationDTO> educations;
    private List<CertificateDTO> certificates;

    @Data
    public static class ExperienceDTO {
        private String jobRole;
        private JobType jobType;
        private String companyName;
        private String location;
        private LocalDate startDate;
        private LocalDate endDate; 
        private String description;
        private boolean currentlyWorking;
    }

    @Data
    public static class EducationDTO {
        private String institutionName;
        private String degree;
        private String fieldOfStudy;
        private Double cgpa;
        private Double percentage;
        private LocalDate startDate;
        private LocalDate endDate;
        private boolean currentlyPursuing;
    }

    @Data
    public static class CertificateDTO {
        private String certificateName;
        private String issuingOrganization;
        private LocalDate issueDate;
        private String credentialId;
        private String credentialUrl;
        private List<String> skills;
        private String description;
    }

    @Data
    public static class ProjectDTO{
        private String title;
        private String description;
        private String websiteLink;
        private LocalDate startDate;
        private LocalDate endDate;
        private boolean currentlyWorking;
    }

    @Override
    public String getEmail(String email) {
        return this.email;
    }
}
