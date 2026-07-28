package com.itjob.mapper;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.itjob.dto.CandidateProfileResponse;
import com.itjob.entities.Candidate;
import com.itjob.entities.Skills;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CandidateMapper {


    private final ExperienceMapper experienceMapper;
    private final EducationMapper educationMapper;
    private final ProjectMapper projectMapper;
    private final CertificateMapper certificateMapper;

    public CandidateProfileResponse toDto(
            Candidate candidate){

        Set<Skills> skillEntities = candidate.getSkills();

        Set<String> skillNames = Collections.emptySet();
        Set<Long> skillIds = Collections.emptySet();
        if (skillEntities != null && !skillEntities.isEmpty()) {
            skillNames = skillEntities.stream()
                    .map(Skills::getSkillName)
                    .collect(Collectors.toSet());
            skillIds = skillEntities.stream()
                    .map(Skills::getId)
                    .collect(Collectors.toSet());
        }

        return CandidateProfileResponse.builder()
                .email(candidate.getEmail())
                .role(candidate.getRole())
                .profileCompleted(candidate.isProfileCompleted())
                .fullName(candidate.getFullName())
                .address(candidate.getAddress())
                .phoneNo(candidate.getPhoneNo())
                .githubLink(candidate.getGithubLink())
                .linkedInLink(candidate.getLinkedInLink())
                .portfolioLink(candidate.getPortfolioLink())
                .about(candidate.getAbout())
                .resumeUrl(candidate.getResumeUrl())
                .resumePublicId(candidate.getResumePublicId())
                .skills(skillNames)
                .skillIds(skillIds)
                .experiences(
                        candidate.getExperiences()
                                .stream()
                                .map(experienceMapper::toDto)
                                .toList())
                .educations(
                        candidate.getEducations()
                                .stream()
                                .map(educationMapper::toDto)
                                .toList())
                .projects(
                        candidate.getProjects()
                                .stream()
                                .map(projectMapper::toDto)
                                .toList())
                .certificates(
                        candidate.getCertificates()
                                .stream()
                                .map(certificateMapper::toDto)
                                .toList())
                .build();
    }

}
