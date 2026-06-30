package com.itjob.entities;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Educations {

    @Id
    @GeneratedValue(strategy= GenerationType.SEQUENCE)
    private Long id;

    @Column(length=25 ,nullable=false)
    @NotBlank(message="Institution name is required")
    private String institutionName;

    @Column(length=20, nullable=false)
    @NotBlank(message="Degree name is required")
    private String degree;

    private String fieldOfStudy;

    private Double cgpa;

    private Double percentage;

    @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern="MM-yyyy")
    private LocalDate startDate;

    @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern="MM-yyyy")
    private LocalDate endDate;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="candidate_id", nullable=false)
    private Candidate candidate;

}
