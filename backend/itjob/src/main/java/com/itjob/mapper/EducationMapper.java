package com.itjob.mapper;

import org.springframework.stereotype.Component;

import com.itjob.dto.CandidateProfileResponse.EducationDTO;
import com.itjob.entities.Education;

@Component
public class EducationMapper {

    public EducationDTO toDto(Education education){

        EducationDTO dto = new EducationDTO();

        dto.setInstitutionName(education.getInstitutionName());
        dto.setDegree(education.getDegree());
        dto.setFieldOfStudy(education.getFieldOfStudy());
        dto.setCgpa(education.getCgpa());
        dto.setPercentage(education.getPercentage());
        dto.setStartDate(education.getStartDate());
        dto.setEndDate(education.getEndDate());
        dto.setCurrentlyPursuing(education.isCurrentlyPursuing());

        return dto;
    }
}
