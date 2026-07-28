package com.itjob.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Application;
import com.itjob.entities.Candidate;
import com.itjob.entities.Job;

public interface ApplicationRepo extends JpaRepository<Application, UUID> {

    boolean existsByCandidateAndJob(Candidate candidate, Job job);

    boolean existsByCandidateEmailAndJobId(String candidateEmail, UUID jobId);

    List<Application> findByCandidateEmail(String email);

    Page<Application> findByCandidateEmail(String email, Pageable pageable);

    List<Application> findByJobId(UUID jobId);

    Page<Application> findByJobId(UUID jobId, Pageable pageable);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.candidate WHERE j.recruiter.email = :recruiterEmail ORDER BY a.applicationDate DESC")
    List<Application> findByJobRecruiterEmail(@Param("recruiterEmail") String recruiterEmail, Pageable pageable);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.candidate WHERE j.recruiter.email = :recruiterEmail AND a.status = 'INTERVIEWING' ORDER BY a.statusUpdatedAt DESC")
    List<Application> findUpcomingInterviews(@Param("recruiterEmail") String recruiterEmail, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Application a JOIN a.job j WHERE j.recruiter.email = :recruiterEmail")
    long countByJobRecruiterEmail(@Param("recruiterEmail") String recruiterEmail);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.autoApplied = true")
    long countAutoApplied();

}
