package com.itjob.services;

import java.util.List;

import com.itjob.dto.ApplicantResponse;
import com.itjob.dto.CandidateProfileRequest;
import com.itjob.dto.CandidateProfileResponse;
import com.itjob.dto.ProfileResponse;

public interface ProfileService {

    public ProfileResponse getProfile(String email);

    public CandidateProfileResponse updateCandidateProfile(String email, CandidateProfileRequest request);

    public List<ApplicantResponse> searchCandidates(String search, String location);
}
