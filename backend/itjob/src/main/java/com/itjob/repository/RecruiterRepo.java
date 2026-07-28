package com.itjob.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Job;
import com.itjob.entities.Recruiter;

public interface RecruiterRepo extends JpaRepository<Recruiter, UUID> {

    Optional<Recruiter> findByEmail(String email);


}
