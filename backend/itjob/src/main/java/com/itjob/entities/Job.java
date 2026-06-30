package com.itjob.entities;

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
import jakarta.persistence.ManyToOne;
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
@Table(name = "itjob_job")
public class Job {

    @Id
    @GeneratedValue(strategy= GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

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

    @ElementCollection
    private List<String> benefits;

    @ElementCollection
    private List<String> skills;

    @Enumerated(EnumType.STRING)
    private WorkLocation workLocation;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="recruiter_id", nullable=false)
    private Recruiter recruiter;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private List<Application> applications = new ArrayList<>();
}
