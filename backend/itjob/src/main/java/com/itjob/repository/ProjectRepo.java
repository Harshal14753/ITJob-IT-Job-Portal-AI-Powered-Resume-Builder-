package com.itjob.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Projects;

public interface ProjectRepo extends JpaRepository<Projects, Long> {

}
