package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Recruiter;

public interface RecuriterRepo extends JpaRepository<Recruiter, UUID> {

}
