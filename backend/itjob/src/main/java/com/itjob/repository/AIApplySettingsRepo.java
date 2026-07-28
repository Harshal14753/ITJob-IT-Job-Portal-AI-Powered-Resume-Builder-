package com.itjob.repository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.itjob.entities.AIApplySettings;

public interface AIApplySettingsRepo extends JpaRepository<AIApplySettings, String> {

    Optional<AIApplySettings> findByCandidateEmail(String email);

    boolean existsByCandidateEmail(String email);

    /**
     * Find all AI apply settings where enabled = true and scheduleTime is before or at the given time.
     * Only candidates who haven't run since before the cutoff time will be processed.
     */
    @Query("SELECT a FROM AIApplySettings a WHERE a.enabled = true " +
           "AND a.scheduleTime <= :currentTime " +
           "AND (a.lastRunAt IS NULL OR a.lastRunAt < :cutoff)")
    List<AIApplySettings> findSettingsReadyToRun(
            @Param("currentTime") LocalTime currentTime,
            @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(a) FROM AIApplySettings a WHERE a.enabled = true")
    long countEnabled();
}
