package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.ApplicantResponse;
import com.itjob.entities.Candidate;
import com.itjob.entities.Recruiter;
import com.itjob.entities.SavedCandidate;
import com.itjob.entities.Skills;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.RecruiterRepo;
import com.itjob.repository.SavedCandidateRepo;
import com.itjob.services.SavedCandidateService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SavedCandidateServiceImpl implements SavedCandidateService {

    private final SavedCandidateRepo savedCandidateRepo;
    private final RecruiterRepo recruiterRepo;
    private final CandidateRepo candidateRepo;

    @Override
    @Transactional
    public void saveCandidate(String recruiterEmail, UUID candidateId) {
        Recruiter recruiter = recruiterRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        Candidate candidate = candidateRepo.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        if (savedCandidateRepo.existsByRecruiterEmailAndCandidateId(recruiterEmail, candidateId)) {
            return; // Already saved
        }

        SavedCandidate savedCandidate = new SavedCandidate();
        savedCandidate.setRecruiter(recruiter);
        savedCandidate.setCandidate(candidate);
        savedCandidate.setSavedAt(LocalDateTime.now());

        savedCandidateRepo.save(savedCandidate);
    }

    @Override
    @Transactional
    public void unsaveCandidate(String recruiterEmail, UUID candidateId) {
        savedCandidateRepo.deleteByRecruiterEmailAndCandidateId(recruiterEmail, candidateId);
    }

    @Override
    public List<ApplicantResponse> getSavedCandidates(String recruiterEmail) {
        List<SavedCandidate> saved = savedCandidateRepo.findByRecruiterEmailWithCandidate(recruiterEmail);

        return saved.stream()
                .map(sc -> {
                    Candidate candidate = sc.getCandidate();

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
                            .skills(candidate.getSkills() != null
                                    ? candidate.getSkills().stream()
                                            .map(Skills::getSkillName)
                                            .collect(java.util.stream.Collectors.toSet())
                                    : null)
                            .skillIds(candidate.getSkills() != null
                                    ? candidate.getSkills().stream()
                                            .map(Skills::getId)
                                            .collect(java.util.stream.Collectors.toSet())
                                    : null)
                            .latestExperienceTitle(latestTitle)
                            .latestExperienceCompany(latestCompany)
                            .build();
                })
                .toList();
    }

    @Override
    public boolean isCandidateSaved(String recruiterEmail, UUID candidateId) {
        return savedCandidateRepo.existsByRecruiterEmailAndCandidateId(recruiterEmail, candidateId);
    }
}
