package com.itjob.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Project;

public interface ProjectRepo extends JpaRepository<Project, Long> {

}
