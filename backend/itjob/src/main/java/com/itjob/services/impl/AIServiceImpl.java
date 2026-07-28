package com.itjob.services.impl;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itjob.config.ResumeTextExtractor;
import com.itjob.dto.ResumeData;
import com.itjob.services.AIService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AIServiceImpl implements AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private Client client;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ResumeTextExtractor resumeTextExtractor = new ResumeTextExtractor();

    @PostConstruct
    public void init() {

        client = Client.builder()
                .apiKey(apiKey)
                .build();

    }

    @Override
    public ResumeData parseResume(MultipartFile file) {

        try {

            String resumeText = resumeTextExtractor.extractText(file);

            String prompt = buildPrompt(resumeText);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.6-flash",
                            prompt,
                            null
                    );
            System.out.println("No error found");

            String json = response.text();

            // Remove markdown if Gemini returns ```json
            json = json.replace("```json", "")
                    .replace("```", "")
                    .trim();

            return objectMapper.readValue(json, ResumeData.class);

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException("Resume parsing failed.", e);

        }
    }

    private String buildPrompt(String resumeText) {

        return """
    You are an expert Resume Parser.

    Your task is to extract information from the given resume and return ONLY valid JSON.

    IMPORTANT RULES:

    1. Return ONLY JSON.
    2. Do NOT use markdown.
    3. Do NOT use ```json.
    4. Do NOT explain anything.
    5. Do NOT rename any field.
    6. Every field name MUST exactly match the schema below.
    7. If information is missing, use:
    - Empty string ("") for String fields.
    - false for boolean fields.
    - Empty array ([]) for lists.
    8. Dates should be in YYYY-MM or YYYY format whenever possible.

    Return JSON in exactly this format:

    {
    "fullName": "",
    "email": "",
    "phoneNo": "",
    "address": "",
    "githubLink": "",
    "linkedInLink": "",
    "portfolioLink": "",
    "about": "",

    "skills": [
        ""
    ],

    "experiences": [
        {
        "jobRole": "",
        "jobType": "",
        "companyName": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "currentlyWorking": false,
        "description": ""
        }
    ],

    "educations": [
        {
        "institutionName": "",
        "degree": "",
        "fieldOfStudy": "",
        "percentage": "",
        "startDate": "",
        "endDate": "",
        "currentlyPursuing": false
        }
    ],

    "projects": [
        {
        "title": "",
        "description": "",
        "websiteLink": "",
        "startDate": "",
        "endDate": "",
        "currentlyWorking": false
        }
    ],

    "certificates": [
        {
        "certificateName": "",
        "issuingOrganization": "",
        "issueDate": "",
        "credentialId": "",
        "credentialUrl": "",
        "description": ""
        }
    ]
    }

    Resume Text:

    """
    + resumeText;
    }

}