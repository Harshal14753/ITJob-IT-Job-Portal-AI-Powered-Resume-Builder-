package com.itjob.dto;

import java.util.List;

import lombok.Data;

@Data
public class ResumeData {
    private String fullName;
    private String email;
    private String phoneNo;
    private String address;
    private String githubLink;
    private String linkedInLink;
    private String portfolioLink;
    private String about;
    private List<String> skills;
    private List<ExperienceItem> experiences;
    private List<EducationItem> educations;
    private List<CertificateItem> certificates;
    private List<ProjectItem> projects;

    @Data
    public static class ExperienceItem {
        private String jobRole;
        private String jobType;
        private String companyName;
        private String location;
        private String startDate;
        private String endDate;
        private Boolean currentlyWorking;
        private String description;
    }

    @Data
    public static class EducationItem {
        private String institutionName;
        private String degree;
        private String fieldOfStudy;
        private String percentage;
        private String startDate;
        private String endDate;
        private Boolean currentlyPursuing;
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

    @Data
    public static class ProjectItem {
        private String title;
        private String description;
        private String websiteLink;
        private String startDate;
        private String endDate;
        private Boolean currentlyWorking;
    }
}
