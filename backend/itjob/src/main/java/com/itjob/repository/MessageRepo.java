package com.itjob.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Message;

public interface MessageRepo extends JpaRepository<Message, UUID> {

    Page<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId, Pageable pageable);

    List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

    long countByConversationIdAndReadAtIsNullAndSenderIdNot(UUID conversationId, UUID senderId);

    @Query("SELECT MAX(m.sentAt) FROM Message m WHERE m.conversation.id = :conversationId")
    java.time.LocalDateTime findLastMessageTimeByConversationId(@Param("conversationId") UUID conversationId);
}
