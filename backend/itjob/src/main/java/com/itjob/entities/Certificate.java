package com.itjob.entities;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Certificate name is required")
    private String certificateName;

    // Not using @NotBlank here because AI-parsed resume data may not include issuing organization
    // Removing the constraint prevents a ConstraintViolationException from blocking the entire profile save.
    // Validation should be handled at the controller/service layer if needed.
    private String issuingOrganization;

    @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern="dd-MM-yyyy")
    private LocalDate issueDate;

    private String credentialId;

    private String credentialUrl;

    @OneToMany(mappedBy="certificate", cascade=CascadeType.ALL)
    private List<Skills> skills = new ArrayList<>();

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="candidate_id", nullable=false)
    private Candidate candidate;

}
