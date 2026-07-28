package com.itjob.mapper;

import org.springframework.stereotype.Component;

import com.itjob.dto.CandidateProfileResponse.ExperienceDTO;
import com.itjob.entities.Experience;

@Component
public class ExperienceMapper {

    public ExperienceDTO toDto(Experience experience) {

        ExperienceDTO dto = new ExperienceDTO();

        dto.setJobRole(experience.getJobRole());
        dto.setJobType(experience.getJobType());
        dto.setCompanyName(experience.getCompanyName());
        dto.setLocation(experience.getLocation());
        dto.setStartDate(experience.getStartDate());
        dto.setEndDate(experience.getEndDate());
        dto.setDescription(experience.getDescription());
        dto.setCurrentlyWorking(experience.isCurrentlyWorking());

        return dto;
    }

}
