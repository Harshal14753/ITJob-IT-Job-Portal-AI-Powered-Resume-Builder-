package com.itjob.services;

import java.util.List;
import java.util.UUID;

import com.itjob.dto.ApplicantResponse;

public interface SavedCandidateService {

    void saveCandidate(String recruiterEmail, UUID candidateId);

    void unsaveCandidate(String recruiterEmail, UUID candidateId);

    List<ApplicantResponse> getSavedCandidates(String recruiterEmail);

    boolean isCandidateSaved(String recruiterEmail, UUID candidateId);
}
