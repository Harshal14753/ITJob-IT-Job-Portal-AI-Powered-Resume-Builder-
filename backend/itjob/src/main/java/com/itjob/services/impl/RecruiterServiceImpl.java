package com.itjob.services.impl;

import org.springframework.stereotype.Service;

import com.itjob.dto.RecruiterProfileRequest;
import com.itjob.dto.RecruiterProfileResponse;
import com.itjob.entities.Recruiter;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.mapper.RecruiterMapper;
import com.itjob.repository.RecruiterRepo;
import com.itjob.services.RecruiterService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecruiterServiceImpl implements RecruiterService {

    private final RecruiterRepo recruiterRepo;  
    private final RecruiterMapper recruiterMapper;  

    @Override
    public RecruiterProfileResponse createProfile(String email, RecruiterProfileRequest request) {
       Recruiter recruiter = recruiterRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recruiter not found"));

        recruiter.setCompanyName(
                request.getCompanyName());

        recruiter.setCompanyWebsite(
                request.getCompanyWebsite());

        recruiter.setDepartment(
                request.getDepartment());

        recruiter.setProfileCompleted(true);

        recruiterRepo.save(recruiter);

        return recruiterMapper.toDto(recruiter);
    }

    @Override
    public RecruiterProfileResponse getProfile(String email) {
        Recruiter recruiter = recruiterRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return recruiterMapper.toDto(recruiter);
    }

    @Override
    public RecruiterProfileResponse updateProfile(String email, RecruiterProfileRequest request) {
        Recruiter recruiter =
                recruiterRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recruiter not found"));

        recruiter.setCompanyName(
                request.getCompanyName());

        recruiter.setCompanyWebsite(
                request.getCompanyWebsite());

        recruiter.setDepartment(
                request.getDepartment());

        recruiterRepo.save(recruiter);

        return recruiterMapper.toDto(recruiter);
    }

    @Override
    public void deleteProfile(String email) {
        Recruiter recruiter = recruiterRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        recruiterRepo.delete(recruiter);
    }

}
