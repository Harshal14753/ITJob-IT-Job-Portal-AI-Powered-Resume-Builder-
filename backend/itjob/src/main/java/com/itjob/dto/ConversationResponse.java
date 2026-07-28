package com.itjob.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationResponse {
    private UUID id;
    private UUID otherUserId;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserRole;
    private String otherUserAvatar;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
