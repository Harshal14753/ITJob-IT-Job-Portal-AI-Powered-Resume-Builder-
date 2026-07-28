package com.itjob.entities;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
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
@Table(name = "candidates")
public class Candidate extends User {

    @Column(length=100)
    private String fullName;

    private String address;

    private String phoneNo;

    private String githubLink;

    private String linkedInLink;

    private String portfolioLink;

    @Column(length= 500)
    private String about;

    @Column(length = 500)
    private String resumeUrl;

    @Column(length = 500)
    private String resumePublicId;

    // Technical Skills (stored as ManyToMany referencing the global skills table)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "candidate_skills",
        joinColumns = @JoinColumn(name = "candidate_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skills> skills = new HashSet<>();

    // Experience
    @OneToMany(mappedBy="candidate", cascade=CascadeType.ALL, orphanRemoval = true)
    private List<Experience> experiences = new ArrayList<>();

    // Project
    @OneToMany(mappedBy="candidate", cascade=CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects =  new ArrayList<>();

    // Education
    @OneToMany(mappedBy="candidate", cascade=CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    // Certficates
    @OneToMany(mappedBy="candidate", cascade=CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certificates =  new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    private List<Application> applications = new ArrayList<>();

}
