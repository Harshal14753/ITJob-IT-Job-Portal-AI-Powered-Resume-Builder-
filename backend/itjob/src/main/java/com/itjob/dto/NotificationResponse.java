package com.itjob.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String message;
    private String referenceId;
    private String referenceType;
    private boolean read;
    private LocalDateTime createdAt;
}
