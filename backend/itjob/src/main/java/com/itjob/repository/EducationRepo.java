package com.itjob.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Education;

public interface EducationRepo extends JpaRepository<Education, Long> {

}
