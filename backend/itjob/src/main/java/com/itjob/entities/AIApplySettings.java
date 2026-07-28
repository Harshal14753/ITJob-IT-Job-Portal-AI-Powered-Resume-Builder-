package com.itjob.entities;

import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ai_apply_settings")
public class AIApplySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false, unique = true)
    private Candidate candidate;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(nullable = false)
    private int matchThreshold = 80; // minimum match score (0-100)

    @Column(nullable = false)
    private LocalTime scheduleTime = LocalTime.of(9, 0); // default 9:00 AM

    // === Preference Criteria for Match Scoring ===

    @Column(length = 2000)
    private String preferredSkills; // comma-separated skill names

    @Column(length = 255)
    private String preferredLocation;

    @Column(length = 50)
    private String preferredJobType; // e.g. FULL_TIME, PART_TIME, etc.

    private Integer preferredMinSalary; // minimum expected salary

    @Column(length = 50)
    private String preferredWorkLocation; // e.g. REMOTE, ON_SITE, HYBRID

    @Column(length = 2000)
    private String preferredTitles; // comma-separated job titles

    private Integer preferredMinExperience; // minimum years of experience

    // === Timestamps ===

    private LocalDateTime lastRunAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
