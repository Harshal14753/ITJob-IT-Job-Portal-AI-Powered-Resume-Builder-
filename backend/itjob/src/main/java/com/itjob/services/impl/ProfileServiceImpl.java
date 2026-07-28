package com.itjob.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.CandidateProfileRequest;
import com.itjob.dto.CandidateProfileRequest.CertificateItem;
import com.itjob.dto.CandidateProfileRequest.EducationItem;
import com.itjob.dto.CandidateProfileRequest.ExperienceItem;
import com.itjob.dto.CandidateProfileRequest.ProjectItem;
import com.itjob.dto.CandidateProfileResponse;
import com.itjob.dto.ProfileResponse;
import com.itjob.dto.RecruiterProfileResponse;
import com.itjob.entities.Candidate;
import com.itjob.entities.Certificate;
import com.itjob.entities.Education;
import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Experience;
import com.itjob.entities.Project;
import com.itjob.entities.Recruiter;
import com.itjob.entities.Skills;
import com.itjob.entities.User;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.mapper.CandidateMapper;
import com.itjob.mapper.RecruiterMapper;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.RecruiterRepo;
import com.itjob.repository.SkillsRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.ProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepo userRepo;
    private final CandidateRepo candidateRepo;
    private final CandidateMapper candidateMapper;
    private final RecruiterMapper recruiterMapper;
    private final SkillsRepo skillsRepo;

    @Override
    public ProfileResponse getProfile(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found!"));

        if (user instanceof Candidate candidate) {
            return candidateMapper.toDto(candidate);
        }

        if (user instanceof Recruiter recruiter) {
            return recruiterMapper.toDto(recruiter);
        }

        throw new ResourceNotFoundException(
                "Profile not found with email : " + email);
    }

    @Override
    @Transactional
    public CandidateProfileResponse updateCandidateProfile(
            String email,
            CandidateProfileRequest request) {

        Candidate candidate = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Candidate not found"));

        // Update basic info
        candidate.setFullName(request.getFullName());
        candidate.setPhoneNo(request.getPhoneNo());
        candidate.setAddress(request.getAddress());
        candidate.setGithubLink(request.getGithubLink());
        candidate.setLinkedInLink(request.getLinkedInLink());
        candidate.setPortfolioLink(request.getPortfolioLink());
        candidate.setAbout(request.getAbout());
        candidate.setResumeUrl(request.getResumeUrl());

        // Update skills (ManyToMany with global skills table)
        candidate.getSkills().clear();
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            List<Skills> skillEntities = skillsRepo.findAllById(request.getSkillIds());
            candidate.getSkills().addAll(skillEntities);
        }

        // Update Experience
        candidate.getExperiences().clear();
        if (request.getExperiences() != null) {
            for (ExperienceItem item : request.getExperiences()) {
                Experience exp = new Experience();
                exp.setJobRole(item.getJobRole());
                if (item.getJobType() != null) {
                    try { exp.setJobType(JobType.valueOf(item.getJobType())); } catch (Exception ignored) {}
                }
                exp.setCompanyName(item.getCompanyName());
                exp.setLocation(item.getLocation());
                if (item.getStartDate() != null && !item.getStartDate().isEmpty()) {
                    try { exp.setStartDate(LocalDate.parse(item.getStartDate())); } catch (Exception ignored) {}
                }
                if (item.getEndDate() != null && !item.getEndDate().isEmpty()) {
                    try { exp.setEndDate(LocalDate.parse(item.getEndDate())); } catch (Exception ignored) {}
                }
                exp.setDescription(item.getDescription());
                exp.setCurrentlyWorking(item.isCurrentlyWorking());
                exp.setCandidate(candidate);
                candidate.getExperiences().add(exp);
            }
        }

        // Update Education
        candidate.getEducations().clear();
        if (request.getEducations() != null) {
            for (EducationItem item : request.getEducations()) {
                Education edu = new Education();
                edu.setInstitutionName(item.getInstitutionName());
                edu.setDegree(item.getDegree());
                edu.setFieldOfStudy(item.getFieldOfStudy());
                if (item.getCgpa() != null && !item.getCgpa().isEmpty()) {
                    try { edu.setCgpa(Double.parseDouble(item.getCgpa())); } catch (Exception ignored) {}
                }
                if (item.getPercentage() != null && !item.getPercentage().isEmpty()) {
                    try { edu.setPercentage(Double.parseDouble(item.getPercentage())); } catch (Exception ignored) {}
                }
                if (item.getStartDate() != null && !item.getStartDate().isEmpty()) {
                    try { edu.setStartDate(LocalDate.parse(item.getStartDate())); } catch (Exception ignored) {}
                }
                if (item.getEndDate() != null && !item.getEndDate().isEmpty()) {
                    try { edu.setEndDate(LocalDate.parse(item.getEndDate())); } catch (Exception ignored) {}
                }
                edu.setCurrentlyPursuing(item.isCurrentlyPursuing());
                edu.setCandidate(candidate);
                candidate.getEducations().add(edu);
            }
        }

        // Update Projects
        candidate.getProjects().clear();
        if (request.getProjects() != null) {
            for (ProjectItem item : request.getProjects()) {
                Project proj = new Project();
                proj.setTitle(item.getTitle());
                proj.setDescription(item.getDescription());
                proj.setWebsiteLink(item.getWebsiteLink());
                if (item.getStartDate() != null && !item.getStartDate().isEmpty()) {
                    try { proj.setStartDate(LocalDate.parse(item.getStartDate())); } catch (Exception ignored) {}
                }
                if (item.getEndDate() != null && !item.getEndDate().isEmpty()) {
                    try { proj.setEndDate(LocalDate.parse(item.getEndDate())); } catch (Exception ignored) {}
                }
                proj.setCurrentlyWorking(item.isCurrentlyWorking());
                proj.setCandidate(candidate);
                candidate.getProjects().add(proj);
            }
        }

        // Update Certificates
        candidate.getCertificates().clear();
        if (request.getCertificates() != null) {
            for (CertificateItem item : request.getCertificates()) {
                Certificate cert = new Certificate();
                cert.setCertificateName(item.getCertificateName());
                cert.setIssuingOrganization(item.getIssuingOrganization());
                if (item.getIssueDate() != null && !item.getIssueDate().isEmpty()) {
                    try { cert.setIssueDate(LocalDate.parse(item.getIssueDate())); } catch (Exception ignored) {}
                }
                cert.setCredentialId(item.getCredentialId());
                cert.setCredentialUrl(item.getCredentialUrl());
                cert.setDescription(item.getDescription());
                cert.setCandidate(candidate);
                candidate.getCertificates().add(cert);
            }
        }

        // Mark profile as completed
        candidate.setProfileCompleted(true);

        candidateRepo.save(candidate);

        return candidateMapper.toDto(candidate);
    }

    @Override
    public List<ApplicantResponse> searchCandidates(String search, String location) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanLocation = (location != null && !location.isBlank()) ? location.trim() : null;

        List<UUID> ids = candidateRepo.searchCandidateIds(cleanSearch, cleanLocation);

        if (ids.isEmpty()) {
            return List.of();
        }

        // Fetch full entities with experiences eagerly loaded in a single query
        Map<UUID, Candidate> candidateMap = candidateRepo.findByIdsWithExperiences(ids).stream()
                .collect(Collectors.toMap(Candidate::getId, c -> c));

        // Preserve the order from the native query
        List<Candidate> candidates = ids.stream()
                .map(candidateMap::get)
                .filter(java.util.Objects::nonNull)
                .toList();

        return candidates.stream()
                .map(candidate -> {
                    String latestTitle = null;
                    String latestCompany = null;
                    if (candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
                        var sorted = candidate.getExperiences().stream()
                                .sorted((a, b) -> {
                                    if (a.getEndDate() == null) return -1;
                                    if (b.getEndDate() == null) return 1;
                                    return b.getEndDate().compareTo(a.getEndDate());
                                })
                                .toList();
                        latestTitle = sorted.get(0).getJobRole();
                        latestCompany = sorted.get(0).getCompanyName();
                    }

                    return ApplicantResponse.builder()
                            .applicationId(null)
                            .applicationDate(null)
                            .status(null)
                            .candidateId(candidate.getId())
                            .fullName(candidate.getFullName())
                            .email(candidate.getEmail())
                            .phoneNo(candidate.getPhoneNo())
                            .address(candidate.getAddress())
                            .githubLink(candidate.getGithubLink())
                            .linkedInLink(candidate.getLinkedInLink())
                            .portfolioLink(candidate.getPortfolioLink())
                            .about(candidate.getAbout())
                            .resumeUrl(candidate.getResumeUrl())
                            .resumePublicId(candidate.getResumePublicId())
                            .skills(candidate.getSkills().stream()
                                    .map(Skills::getSkillName)
                                    .collect(java.util.stream.Collectors.toSet()))
                            .skillIds(candidate.getSkills().stream()
                                    .map(Skills::getId)
                                    .collect(java.util.stream.Collectors.toSet()))
                            .latestExperienceTitle(latestTitle)
                            .latestExperienceCompany(latestCompany)
                            .build();
                })
                .toList();
    }

}
