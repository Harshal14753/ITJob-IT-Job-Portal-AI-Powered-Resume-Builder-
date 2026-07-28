package com.itjob.dto;

import java.util.List;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

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

    private List<Long> skillIds;

    private WorkLocation workLocation;

}
