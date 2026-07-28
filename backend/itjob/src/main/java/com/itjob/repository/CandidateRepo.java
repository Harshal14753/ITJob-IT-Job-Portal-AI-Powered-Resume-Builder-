package com.itjob.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Candidate;

public interface CandidateRepo extends JpaRepository<Candidate, UUID> {

    Optional<Candidate> findByEmail(String email);

    @Query(value = "SELECT DISTINCT c.user_id FROM candidates c " +
           "JOIN itjob_user u ON c.user_id = u.user_id " +
           "LEFT JOIN experience e ON c.user_id = e.candidate_id " +
           "WHERE (CAST(:search AS text) IS NULL OR " +
           "LOWER(c.full_name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.about) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT 1 FROM candidate_skills cs JOIN skills s ON cs.skill_id = s.id WHERE cs.candidate_id = c.user_id AND LOWER(s.skill) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(CAST(:location AS text) IS NULL OR LOWER(CAST(c.address AS TEXT)) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "ORDER BY c.full_name",
           nativeQuery = true)
    List<UUID> searchCandidateIds(
            @Param("search") String search,
            @Param("location") String location
    );

    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.experiences WHERE c.id IN :ids")
    List<Candidate> findByIdsWithExperiences(@Param("ids") List<UUID> ids);

}
