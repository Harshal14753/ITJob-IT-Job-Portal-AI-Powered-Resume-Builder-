package com.itjob.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminContactResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private boolean resolved;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
