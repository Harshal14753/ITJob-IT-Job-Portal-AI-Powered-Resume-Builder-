package com.itjob.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.itjob.dto.CandidateProfileResponse.CertificateDTO;
import com.itjob.entities.Certificate;

@Component
public class CertificateMapper {

    public CertificateDTO toDto(Certificate certificate){

        CertificateDTO dto = new CertificateDTO();

        dto.setCertificateName(certificate.getCertificateName());
        dto.setIssuingOrganization(certificate.getIssuingOrganization());
        dto.setIssueDate(certificate.getIssueDate());
        dto.setCredentialId(certificate.getCredentialId());
        dto.setCredentialUrl(certificate.getCredentialUrl());
        dto.setDescription(certificate.getDescription());

        List<String> skills = certificate.getSkills()
                .stream()
                .map(skill -> skill.getSkill())
                .toList();

        dto.setSkills(skills);

        return dto;
    }
}
