package com.itjob.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Skills;

public interface SkillsRepo extends JpaRepository<Skills, Long> {

    List<Skills> findAllByOrderBySkillAsc();

    List<Skills> findBySkillContainingIgnoreCaseOrderBySkillAsc(String skill);

    boolean existsBySkillIgnoreCase(String skill);

    Optional<Skills> findBySkillIgnoreCase(String skill);

}
