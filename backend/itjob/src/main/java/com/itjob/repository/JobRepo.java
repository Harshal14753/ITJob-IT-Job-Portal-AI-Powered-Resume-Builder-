package com.itjob.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Job;

public interface JobRepo extends JpaRepository<Job, UUID> {

    List<Job> findByRecruiterEmail(String email);

    Page<Job> findByRecruiterEmail(String email, Pageable pageable);

    List<Job> findTop5ByRecruiterEmailOrderByCreatedAtDesc(String email);

    Optional<Job> findByIdAndRecruiterEmail(UUID id, String email);

    Optional<Job> findById(UUID id);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.recruiter.email = :email AND j.isActive = true")
    long countActiveJobsByRecruiterEmail(@Param("email") String email);

    @Query("SELECT j FROM Job j WHERE j.isApproved = false AND j.isActive = true ORDER BY j.createdAt DESC")
    List<Job> findPendingJobs();

    @Query("SELECT j FROM Job j WHERE j.expiresAt IS NOT NULL AND j.expiresAt < :now AND j.isActive = true")
    List<Job> findExpiredActiveJobs(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(j) > 0 FROM Job j WHERE j.recruiter.email = :email AND LOWER(j.title) = LOWER(:title) AND j.isActive = true")
    boolean existsDuplicateActiveJob(@Param("email") String email, @Param("title") String title);

    @Query("SELECT j FROM Job j WHERE j.isApproved = true " +
           "AND (j.isActive = true OR j.isActive IS NULL) " +
           "AND (j.expiresAt IS NULL OR j.expiresAt > :now)")
    List<Job> findActiveApprovedJobs(@Param("now") LocalDateTime now);

    @Query(value = "SELECT j FROM Job j WHERE " +
           "(:skills IS NULL OR EXISTS (SELECT 1 FROM j.skills s WHERE LOWER(s.skill) IN :skills)) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minExperience IS NULL OR j.minExperience IS NULL OR j.minExperience <= :minExperience)")
    List<Job> searchJobs(
            @Param("skills") List<String> skills,
            @Param("location") String location,
            @Param("minExperience") Integer minExperience
    );

    @Query(value = "SELECT j FROM Job j WHERE " +
           "(:skills IS NULL OR EXISTS (SELECT 1 FROM j.skills s WHERE LOWER(s.skill) IN :skills)) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minExperience IS NULL OR j.minExperience IS NULL OR j.minExperience <= :minExperience)",
           countQuery = "SELECT COUNT(j) FROM Job j WHERE " +
           "(:skills IS NULL OR EXISTS (SELECT 1 FROM j.skills s WHERE LOWER(s.skill) IN :skills)) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minExperience IS NULL OR j.minExperience IS NULL OR j.minExperience <= :minExperience)")
    Page<Job> searchJobs(
            @Param("skills") List<String> skills,
            @Param("location") String location,
            @Param("minExperience") Integer minExperience,
            Pageable pageable
    );

}
