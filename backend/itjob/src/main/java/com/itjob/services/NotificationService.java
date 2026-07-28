package com.itjob.services;

import java.util.List;
import java.util.UUID;

import com.itjob.dto.NotificationResponse;

public interface NotificationService {

    // Create a notification for a recipient
    NotificationResponse createNotification(
            String recipientEmail,
            String type,
            String title,
            String message,
            String referenceId,
            String referenceType);

    // Get all notifications for a user (most recent first)
    List<NotificationResponse> getNotifications(String userEmail);

    // Get only unread notifications
    List<NotificationResponse> getUnreadNotifications(String userEmail);

    // Get unread count
    long getUnreadCount(String userEmail);

    // Mark a single notification as read
    void markAsRead(UUID notificationId, String userEmail);

    // Mark all notifications as read for a user
    void markAllAsRead(String userEmail);
}
