package com.itjob.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Table(name = "recruiter")
public class Recruiter extends User {

    private String companyName;

    private String companyWebsite;

    private String department;

    @OneToMany(mappedBy="recruiter", cascade=CascadeType.ALL)
    private List<Job> jobPosted = new ArrayList<>();

}
