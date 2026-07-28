package com.itjob.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "itjob_job")
public class Job {

    @Id
    @GeneratedValue(strategy= GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_approved")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Boolean isApproved = false;

    @Column(name = "is_featured")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Boolean isFeatured = false;

    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;

    @Column(name = "is_active")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Boolean isActive = true;

    @Column(length = 2000, nullable = false)
    private String description;

    private String location;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    private String websiteLink;

    private Integer vacancy;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Column(name = "min_experience")
    private Integer minExperience;

    @ElementCollection
    private List<String> benefits = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skills> skills = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private WorkLocation workLocation;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="recruiter_id", nullable=false)
    private Recruiter recruiter;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private List<Application> applications = new ArrayList<>();

    // Custom getters/setters for boolean fields — handle null from existing DB rows
    public boolean isApproved() {
        return isApproved != null ? isApproved : false;
    }

    public void setApproved(boolean approved) {
        this.isApproved = approved;
    }

    public boolean isFeatured() {
        return isFeatured != null ? isFeatured : false;
    }

    public void setFeatured(boolean featured) {
        this.isFeatured = featured;
    }

    public boolean isActive() {
        return isActive != null ? isActive : true;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}
