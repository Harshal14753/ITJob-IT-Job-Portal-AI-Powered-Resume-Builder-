package com.itjob.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.ConversationResponse;
import com.itjob.dto.MessageResponse;
import com.itjob.dto.SendMessageRequest;
import com.itjob.services.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    private final MessageService messageService;

    // ========== Recruiter Endpoints ==========

    @GetMapping("/api/v1/recruiter/messages/conversations")
    public ResponseEntity<List<ConversationResponse>> getRecruiterConversations(Authentication auth) {
        return ResponseEntity.ok(messageService.getConversations(auth.getName()));
    }

    @PostMapping("/api/v1/recruiter/messages/conversations/{candidateId}")
    public ResponseEntity<ConversationResponse> createOrGetConversation(
            @PathVariable UUID candidateId,
            Authentication auth) {
        return ResponseEntity.ok(messageService.createOrGetConversation(auth.getName(), candidateId));
    }

    @GetMapping("/api/v1/recruiter/messages/conversations/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getRecruiterMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, auth.getName(), page, size));
    }

    @PostMapping("/api/v1/recruiter/messages/conversations/{conversationId}/send")
    public ResponseEntity<MessageResponse> sendRecruiterMessage(
            @PathVariable UUID conversationId,
            @RequestBody SendMessageRequest request,
            Authentication auth) {
        return ResponseEntity.ok(messageService.sendMessage(conversationId, auth.getName(), request.getContent()));
    }

    @PutMapping("/api/v1/recruiter/messages/conversations/{conversationId}/read")
    public ResponseEntity<String> markRecruiterAsRead(
            @PathVariable UUID conversationId,
            Authentication auth) {
        messageService.markAsRead(conversationId, auth.getName());
        return ResponseEntity.ok("Marked as read");
    }

    @GetMapping("/api/v1/recruiter/messages/unread-count")
    public ResponseEntity<Long> getRecruiterUnreadCount(Authentication auth) {
        return ResponseEntity.ok(messageService.getUnreadCount(auth.getName()));
    }

    // ========== Candidate Endpoints ==========

    @GetMapping("/api/v1/candidate/messages/conversations")
    public ResponseEntity<List<ConversationResponse>> getCandidateConversations(Authentication auth) {
        return ResponseEntity.ok(messageService.getConversations(auth.getName()));
    }

    @GetMapping("/api/v1/candidate/messages/conversations/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getCandidateMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, auth.getName(), page, size));
    }

    @PostMapping("/api/v1/candidate/messages/conversations/{conversationId}/send")
    public ResponseEntity<MessageResponse> sendCandidateMessage(
            @PathVariable UUID conversationId,
            @RequestBody SendMessageRequest request,
            Authentication auth) {
        return ResponseEntity.ok(messageService.sendMessage(conversationId, auth.getName(), request.getContent()));
    }

    @PutMapping("/api/v1/candidate/messages/conversations/{conversationId}/read")
    public ResponseEntity<String> markCandidateAsRead(
            @PathVariable UUID conversationId,
            Authentication auth) {
        messageService.markAsRead(conversationId, auth.getName());
        return ResponseEntity.ok("Marked as read");
    }

    @GetMapping("/api/v1/candidate/messages/unread-count")
    public ResponseEntity<Long> getCandidateUnreadCount(Authentication auth) {
        return ResponseEntity.ok(messageService.getUnreadCount(auth.getName()));
    }
}
