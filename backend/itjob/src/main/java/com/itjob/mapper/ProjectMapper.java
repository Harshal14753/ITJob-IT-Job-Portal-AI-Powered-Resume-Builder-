package com.itjob.mapper;

import org.springframework.stereotype.Component;

import com.itjob.dto.CandidateProfileResponse.ProjectDTO;
import com.itjob.entities.Project;

@Component
public class ProjectMapper {

    public ProjectDTO toDto(Project project){

        ProjectDTO dto = new ProjectDTO();

        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setWebsiteLink(project.getWebsiteLink());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setCurrentlyWorking(project.isCurrentlyWorking());

        return dto;
    }


}
