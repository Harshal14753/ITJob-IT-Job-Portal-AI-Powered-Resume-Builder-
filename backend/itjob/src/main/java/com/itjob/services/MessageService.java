package com.itjob.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.itjob.dto.ConversationResponse;
import com.itjob.dto.MessageResponse;

public interface MessageService {

    // Start or get existing conversation between a recruiter and a candidate
    ConversationResponse createOrGetConversation(String recruiterEmail, UUID candidateId);

    // Send a message in a conversation
    MessageResponse sendMessage(UUID conversationId, String senderEmail, String content);

    // Get all conversations for a user (detects role automatically)
    List<ConversationResponse> getConversations(String userEmail);

    // Get paginated messages for a conversation
    Page<MessageResponse> getMessages(UUID conversationId, String userEmail, int page, int size);

    // Mark all messages as read in a conversation
    void markAsRead(UUID conversationId, String userEmail);

    // Get total unread count across all conversations
    long getUnreadCount(String userEmail);
}
