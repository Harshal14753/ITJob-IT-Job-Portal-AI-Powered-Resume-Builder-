package com.itjob.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Conversation;

public interface ConversationRepo extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByRecruiterEmailAndCandidateId(String recruiterEmail, UUID candidateId);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.recruiter JOIN FETCH c.candidate " +
           "WHERE c.recruiter.email = :email ORDER BY c.updatedAt DESC")
    List<Conversation> findByRecruiterEmailOrderByUpdatedAtDesc(@Param("email") String email);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.recruiter JOIN FETCH c.candidate " +
           "WHERE c.candidate.email = :email ORDER BY c.updatedAt DESC")
    List<Conversation> findByCandidateEmailOrderByUpdatedAtDesc(@Param("email") String email);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.candidate.email = :email AND c.updatedAt > :since")
    long countUnreadByCandidateEmail(@Param("email") String email, @Param("since") java.time.LocalDateTime since);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.recruiter.email = :email AND c.updatedAt > :since")
    long countUnreadByRecruiterEmail(@Param("email") String email, @Param("since") java.time.LocalDateTime since);
}
