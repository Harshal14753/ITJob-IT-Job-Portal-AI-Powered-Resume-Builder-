package com.itjob.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.Contact;

public interface ContactRepo extends JpaRepository<Contact, UUID> {

    List<Contact> findByResolvedOrderByCreatedAtDesc(boolean resolved);

    List<Contact> findAllByOrderByCreatedAtDesc();
}
