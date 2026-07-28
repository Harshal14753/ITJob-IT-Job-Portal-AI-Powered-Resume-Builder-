package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.ConversationResponse;
import com.itjob.dto.MessageResponse;
import com.itjob.entities.Candidate;
import com.itjob.entities.Conversation;
import com.itjob.entities.Message;
import com.itjob.entities.Recruiter;
import com.itjob.entities.User;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.ConversationRepo;
import com.itjob.repository.MessageRepo;
import com.itjob.repository.RecruiterRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.MessageService;
import com.itjob.services.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationRepo conversationRepo;
    private final MessageRepo messageRepo;
    private final UserRepo userRepo;
    private final CandidateRepo candidateRepo;
    private final RecruiterRepo recruiterRepo;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ConversationResponse createOrGetConversation(String recruiterEmail, UUID candidateId) {
        // Find existing conversation
        var existing = conversationRepo.findByRecruiterEmailAndCandidateId(recruiterEmail, candidateId);
        if (existing.isPresent()) {
            Conversation conv = existing.get();
            return toConversationResponse(conv, recruiterEmail);
        }

        // Create new conversation
        Recruiter recruiter = recruiterRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        Candidate candidate = candidateRepo.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Conversation conversation = new Conversation();
        conversation.setRecruiter(recruiter);
        conversation.setCandidate(candidate);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setLastMessage(null);

        conversation = conversationRepo.save(conversation);
        return toConversationResponse(conversation, recruiterEmail);
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(UUID conversationId, String senderEmail, String content) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        User sender = userRepo.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        // Verify sender is part of this conversation
        boolean isParticipant = conversation.getRecruiter().getEmail().equals(senderEmail)
                || conversation.getCandidate().getEmail().equals(senderEmail);

        if (!isParticipant) {
            throw new RuntimeException("You are not a participant in this conversation");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        message.setReadAt(null);

        message = messageRepo.save(message);

        // Update conversation metadata
        conversation.setLastMessage(content.length() > 100 ? content.substring(0, 100) + "..." : content);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepo.save(conversation);

        // Create notification for the recipient
        boolean senderIsRecruiter = conversation.getRecruiter().getEmail().equals(senderEmail);
        String recipientEmail = senderIsRecruiter
                ? conversation.getCandidate().getEmail()
                : conversation.getRecruiter().getEmail();

        String senderLabel = senderIsRecruiter
                ? (conversation.getRecruiter().getCompanyName() != null
                        ? conversation.getRecruiter().getCompanyName()
                        : conversation.getRecruiter().getEmail())
                : (conversation.getCandidate().getFullName() != null
                        ? conversation.getCandidate().getFullName()
                        : conversation.getCandidate().getEmail());

        // Truncate content for notification message
        String preview = content.length() > 80 ? content.substring(0, 80) + "..." : content;

        notificationService.createNotification(
                recipientEmail,
                "MESSAGE",
                "New message from " + senderLabel,
                preview,
                conversation.getId().toString(),
                "conversation");

        return toMessageResponse(message, senderEmail);
    }

    @Override
    public List<ConversationResponse> getConversations(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Conversation> conversations;
        if (user instanceof Recruiter) {
            conversations = conversationRepo.findByRecruiterEmailOrderByUpdatedAtDesc(userEmail);
        } else if (user instanceof Candidate) {
            conversations = conversationRepo.findByCandidateEmailOrderByUpdatedAtDesc(userEmail);
        } else {
            return new ArrayList<>();
        }

        return conversations.stream()
                .map(conv -> toConversationResponse(conv, userEmail))
                .toList();
    }

    @Override
    public Page<MessageResponse> getMessages(UUID conversationId, String userEmail, int page, int size) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Verify user is a participant
        boolean isParticipant = conversation.getRecruiter().getEmail().equals(userEmail)
                || conversation.getCandidate().getEmail().equals(userEmail);

        if (!isParticipant) {
            throw new RuntimeException("You are not a participant in this conversation");
        }

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Message> messages = messageRepo.findByConversationIdOrderBySentAtAsc(conversationId, pageRequest);

        List<MessageResponse> responses = messages.getContent().stream()
                .map(msg -> toMessageResponse(msg, userEmail))
                .toList();

        return new PageImpl<>(responses, pageRequest, messages.getTotalElements());
    }

    @Override
    @Transactional
    public void markAsRead(UUID conversationId, String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Message> messages = messageRepo.findByConversationIdOrderBySentAtAsc(conversationId);
        LocalDateTime now = LocalDateTime.now();

        for (Message msg : messages) {
            if (msg.getReadAt() == null && !msg.getSender().getId().equals(user.getId())) {
                msg.setReadAt(now);
            }
        }

        messageRepo.saveAll(messages);
    }

    @Override
    public long getUnreadCount(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // We approximate unread by checking conversations updated after the user's last read
        // A more precise approach would track per-user read timestamps per conversation
        List<Conversation> conversations;
        if (user instanceof Recruiter) {
            conversations = conversationRepo.findByRecruiterEmailOrderByUpdatedAtDesc(userEmail);
        } else if (user instanceof Candidate) {
            conversations = conversationRepo.findByCandidateEmailOrderByUpdatedAtDesc(userEmail);
        } else {
            return 0;
        }

        long totalUnread = 0;
        for (Conversation conv : conversations) {
            totalUnread += messageRepo.countByConversationIdAndReadAtIsNullAndSenderIdNot(
                    conv.getId(), user.getId());
        }

        return totalUnread;
    }

    // ========== Helper methods ==========

    private ConversationResponse toConversationResponse(Conversation conv, String userEmail) {
        boolean isRecruiter = conv.getRecruiter().getEmail().equals(userEmail);
        User otherUser = isRecruiter ? conv.getCandidate() : conv.getRecruiter();

        // Count unread messages
        User currentUser = isRecruiter ? conv.getRecruiter() : conv.getCandidate();
        long unread = messageRepo.countByConversationIdAndReadAtIsNullAndSenderIdNot(
                conv.getId(), currentUser.getId());

        String avatar;
        String otherName;
        if (otherUser instanceof Candidate) {
            Candidate c = (Candidate) otherUser;
            otherName = c.getFullName() != null ? c.getFullName() : c.getEmail();
            avatar = c.getFullName() != null
                    ? c.getFullName().split(" ")[0].toUpperCase().charAt(0) + ""
                    : "?";
        } else if (otherUser instanceof Recruiter) {
            Recruiter r = (Recruiter) otherUser;
            otherName = r.getCompanyName() != null ? r.getCompanyName() : r.getEmail();
            avatar = r.getCompanyName() != null
                    ? r.getCompanyName().charAt(0) + ""
                    : "?";
        } else {
            otherName = otherUser.getEmail();
            avatar = "?";
        }

        return ConversationResponse.builder()
                .id(conv.getId())
                .otherUserId(otherUser.getId())
                .otherUserName(otherName)
                .otherUserEmail(otherUser.getEmail())
                .otherUserRole(isRecruiter ? "CANDIDATE" : "RECRUITER")
                .otherUserAvatar(avatar)
                .lastMessage(conv.getLastMessage())
                .lastMessageAt(conv.getUpdatedAt())
                .unreadCount(unread)
                .build();
    }

    private MessageResponse toMessageResponse(Message msg, String userEmail) {
        String senderName;
        if (msg.getSender() instanceof Candidate) {
            Candidate c = (Candidate) msg.getSender();
            senderName = c.getFullName() != null ? c.getFullName() : c.getEmail();
        } else if (msg.getSender() instanceof Recruiter) {
            Recruiter r = (Recruiter) msg.getSender();
            senderName = r.getCompanyName() != null ? r.getCompanyName() : r.getEmail();
        } else {
            senderName = msg.getSender().getEmail();
        }

        return MessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(msg.getSender().getId())
                .senderEmail(msg.getSender().getEmail())
                .senderName(senderName)
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .readAt(msg.getReadAt())
                .isMine(msg.getSender().getEmail().equals(userEmail))
                .build();
    }
}
