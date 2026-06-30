package com.itjob.entities;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Projects {

    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE)
    private Long id;

    @Column(length=20, nullable=false)
    private String title;

    @Column(length=200, nullable=false)
    private String description;

    private String websiteLink;

    @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern="MM-yyyy")
    private Date startDate;

    @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern="MM-yyyy")
    private Date endDate;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="candidate_id", nullable=false)
    private Candidate candidate;

}
