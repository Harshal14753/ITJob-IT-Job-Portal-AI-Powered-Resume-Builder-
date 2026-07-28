package com.itjob.mapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import com.itjob.dto.JobRequest;
import com.itjob.dto.JobResponse;
import com.itjob.entities.Job;
import com.itjob.entities.Skills;
import com.itjob.repository.SkillsRepo;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JobMapper {

    private final SkillsRepo skillsRepo;

    public Job toEntity(JobRequest request) {

        if (request == null) {
            return null;
        }

        Job job = new Job();

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setWebsiteLink(request.getWebsiteLink());
        job.setVacancy(request.getVacancy());
        job.setJobType(request.getJobType());
        job.setMinExperience(request.getMinExperience());
        job.setBenefits(request.getBenefits());
        job.setWorkLocation(request.getWorkLocation());

        // Resolve skill IDs to Skills entities
        if (request.getSkillIds() != null) {
            List<Skills> skillEntities = skillsRepo.findAllById(request.getSkillIds());
            job.setSkills(skillEntities);
        } else {
            job.setSkills(new ArrayList<>());
        }

        return job;
    }

    public JobResponse toDto(Job job) {

        if (job == null) {
            return null;
        }

        // Extract skill names and IDs
        List<String> skillNames = Collections.emptyList();
        List<Long> skillIds = Collections.emptyList();
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            skillNames = job.getSkills().stream()
                    .map(Skills::getSkillName)
                    .toList();
            skillIds = job.getSkills().stream()
                    .map(Skills::getId)
                    .toList();
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .websiteLink(job.getWebsiteLink())
                .vacancy(job.getVacancy())
                .jobType(job.getJobType())
                .minExperience(job.getMinExperience())
                .benefits(job.getBenefits())
                .skills(skillNames)
                .skillIds(skillIds)
                .workLocation(job.getWorkLocation())

                // recruiter information
                .status(computeStatus(job))
                .recruiterId(job.getRecruiter().getId())
                .companyName(job.getRecruiter().getCompanyName())

                // recruiter dashboard statistics
                .totalApplications(
                        job.getApplications() == null
                                ? 0
                                : job.getApplications().size()
                )

                .build();
    }

    public JobResponse toDtoWithApplicationStatus(Job job, boolean hasApplied) {
        JobResponse response = toDto(job);
        if (response != null) {
            response.setHasApplied(hasApplied);
        }
        return response;
    }

    public void updateEntity(Job job, JobRequest request) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setWebsiteLink(request.getWebsiteLink());
        job.setVacancy(request.getVacancy());
        job.setJobType(request.getJobType());
        job.setMinExperience(request.getMinExperience());
        job.setBenefits(request.getBenefits());
        job.setWorkLocation(request.getWorkLocation());

        // Resolve skill IDs to Skills entities
        if (request.getSkillIds() != null) {
            List<Skills> skillEntities = skillsRepo.findAllById(request.getSkillIds());
            job.setSkills(skillEntities);
        } else {
            job.setSkills(new ArrayList<>());
        }
    }

    private String computeStatus(Job job) {
        if (!job.isActive()) {
            return "DRAFT";
        }
        if (job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now())) {
            return "CLOSED";
        }
        if (!job.isApproved()) {
            return "PENDING_APPROVAL";
        }
        return "ACTIVE";
    }

}
