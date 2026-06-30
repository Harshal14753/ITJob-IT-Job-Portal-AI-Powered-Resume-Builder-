package com.itjob.entities;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Skills {

    @Id
    @GeneratedValue(strategy= GenerationType.SEQUENCE)
    private Long id;

    private String skill;

    @ManyToMany(mappedBy= "skills",fetch=FetchType.LAZY)
    private Set<Candidate> candidate = new HashSet<>();

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="certificate_id", nullable=false)
    private Certificate certificate;
}
