package com.itjob.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Experience;

public interface ExperienceRepo extends JpaRepository<Experience, Long> {

}
