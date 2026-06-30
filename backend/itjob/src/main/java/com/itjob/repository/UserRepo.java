package com.itjob.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itjob.entities.User;

public interface UserRepo extends JpaRepository<User, UUID> {

}
