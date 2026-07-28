package com.itjob.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.SavedCandidate;

public interface SavedCandidateRepo extends JpaRepository<SavedCandidate, UUID> {

    @Query("SELECT sc FROM SavedCandidate sc JOIN FETCH sc.candidate c JOIN FETCH c.experiences WHERE sc.recruiter.email = :recruiterEmail ORDER BY sc.savedAt DESC")
    List<SavedCandidate> findByRecruiterEmailWithCandidate(@Param("recruiterEmail") String recruiterEmail);

    Optional<SavedCandidate> findByRecruiterEmailAndCandidateId(String recruiterEmail, UUID candidateId);

    boolean existsByRecruiterEmailAndCandidateId(String recruiterEmail, UUID candidateId);

    void deleteByRecruiterEmailAndCandidateId(String recruiterEmail, UUID candidateId);
}
