package com.itjob.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.itjob.entities.Enums.Role;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {
    private UUID id;
    private String email;
    private Role role;
    private boolean profileCompleted;
    private String fullName;
    private String companyName;
    private LocalDateTime createdAt;
}
