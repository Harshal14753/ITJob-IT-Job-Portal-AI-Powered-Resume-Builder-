package com.itjob.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.Interview;

public interface InterviewRepo extends JpaRepository<Interview, UUID> {

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j JOIN FETCH a.candidate c WHERE j.recruiter.email = :recruiterEmail ORDER BY i.interviewDate DESC, i.interviewTime DESC")
    List<Interview> findByRecruiterEmailOrderByDateDesc(@Param("recruiterEmail") String recruiterEmail);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j JOIN FETCH a.candidate c WHERE j.recruiter.email = :recruiterEmail AND i.status = 'SCHEDULED' ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findUpcomingByRecruiterEmail(@Param("recruiterEmail") String recruiterEmail);

    List<Interview> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j JOIN FETCH a.candidate c WHERE c.email = :candidateEmail ORDER BY i.interviewDate DESC, i.interviewTime DESC")
    List<Interview> findByCandidateEmail(@Param("candidateEmail") String candidateEmail);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j JOIN FETCH a.candidate c WHERE c.email = :candidateEmail AND i.status = 'SCHEDULED' ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findUpcomingByCandidateEmail(@Param("candidateEmail") String candidateEmail);

}
