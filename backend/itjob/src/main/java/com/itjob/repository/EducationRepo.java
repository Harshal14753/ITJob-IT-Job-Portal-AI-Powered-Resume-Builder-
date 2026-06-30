package com.itjob.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Educations;

public interface EducationRepo extends JpaRepository<Educations, Long> {

}
