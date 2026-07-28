package com.itjob.services;

import com.itjob.dto.RecruiterProfileRequest;
import com.itjob.dto.RecruiterProfileResponse;

public interface RecruiterService {

    RecruiterProfileResponse createProfile( String email, RecruiterProfileRequest request);

    RecruiterProfileResponse getProfile( String email);

    RecruiterProfileResponse updateProfile( String email, RecruiterProfileRequest request);

    void deleteProfile(String email);
}
