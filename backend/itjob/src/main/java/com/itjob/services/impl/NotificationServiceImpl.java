package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.NotificationResponse;
import com.itjob.entities.Notification;
import com.itjob.entities.User;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.NotificationRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    @Override
    @Transactional
    public NotificationResponse createNotification(
            String recipientEmail,
            String type,
            String title,
            String message,
            String referenceId,
            String referenceType) {

        User recipient = userRepo.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found: " + recipientEmail));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notification = notificationRepo.save(notification);
        return toResponse(notification);
    }

    @Override
    public List<NotificationResponse> getNotifications(String userEmail) {
        return notificationRepo.findByRecipientEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        return notificationRepo.findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public long getUnreadCount(String userEmail) {
        return notificationRepo.countByRecipientEmailAndIsReadFalse(userEmail);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, String userEmail) {
        notificationRepo.markAsRead(notificationId, userEmail);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        notificationRepo.markAllAsRead(userEmail);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
