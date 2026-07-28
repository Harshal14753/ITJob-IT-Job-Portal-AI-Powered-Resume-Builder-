package com.itjob.mapper;

import org.springframework.stereotype.Component;

import com.itjob.dto.RecruiterProfileResponse;
import com.itjob.entities.Recruiter;

@Component
public class RecruiterMapper {

    public RecruiterProfileResponse toDto(
            Recruiter recruiter){

        return RecruiterProfileResponse.builder()
                .companyName(
                        recruiter.getCompanyName())
                .companyWebsite(
                        recruiter.getCompanyWebsite())
                .department(
                        recruiter.getDepartment())
                .build();
    }

}
