package com.itjob.dto;

import com.itjob.entities.Enums.ApplicationStatus;

import lombok.Data;

@Data
public class ApplicationStatusRequest {

    private ApplicationStatus status;
}
