package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Candidate;

public interface CandidateRepo extends JpaRepository<Candidate, UUID> {

}
