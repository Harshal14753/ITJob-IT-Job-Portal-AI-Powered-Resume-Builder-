package com.itjob.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecruiterProfileRequest {

    @NotBlank(message = "Company name required")
    private String companyName;

    private String companyWebsite;

    private String department;
}
