package com.itjob.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class InterviewRequest {
    private LocalDate interviewDate;
    private LocalTime interviewTime;
    private String interviewMode; // VIDEO_CALL, PHONE, IN_PERSON
    private String interviewLink;
    private String notes;
}
