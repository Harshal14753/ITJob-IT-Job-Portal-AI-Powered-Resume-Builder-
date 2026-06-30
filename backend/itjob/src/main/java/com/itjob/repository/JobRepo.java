package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Job;

public interface JobRepo extends JpaRepository<Job, UUID> {

}
