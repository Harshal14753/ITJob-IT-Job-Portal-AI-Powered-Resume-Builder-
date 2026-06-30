package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Application;

public interface ApplicationRepo extends JpaRepository<Application, UUID> {

}
