package com.itjob.services;

import org.springframework.web.multipart.MultipartFile;

import com.itjob.dto.ResumeData;

public interface AIService {

    /**
     * Parse a resume PDF/DOC file using Google Gemini Flash API
     * and return structured profile data.
     */
    ResumeData parseResume(MultipartFile file);
}
