package com.itjob.dto;

import java.util.List;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.Role;
import com.itjob.entities.Enums.WorkLocation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecruiterProfileResponse implements ProfileResponse {

    private String email;
    private Role role;

    private String companyName;
    private String companyWebsite;
    private String department;
    private List<JobDTO> jobPosted;

    public static class JobDTO {
        private String title;
        private String description;
        private String location;
        private Integer salaryMin;
        private Integer salaryMax;
        private String websiteLink;
        private Integer vacancy;
        private JobType jobType;
        private List<String> benefits;   
        private List<String> skills;
        private WorkLocation workLocation;
    }

    @Override
    public String getEmail(String email) {
       return this.email;
    }
}
