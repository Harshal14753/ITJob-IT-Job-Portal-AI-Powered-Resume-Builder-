package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Certificate;

public interface CertificateRepo extends JpaRepository<Certificate, UUID> {

}
