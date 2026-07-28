package com.itjob.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Notification;

public interface NotificationRepo extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(String email);

    long countByRecipientEmailAndIsReadFalse(String email);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.email = :email")
    void markAllAsRead(@Param("email") String email);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.recipient.email = :email")
    void markAsRead(@Param("id") UUID id, @Param("email") String email);
}
