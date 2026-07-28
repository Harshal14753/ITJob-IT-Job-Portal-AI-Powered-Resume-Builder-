package com.itjob.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.itjob.entities.Candidate;
import com.itjob.repository.CandidateRepo;
import com.itjob.services.CloudinaryService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/candidate/resume")
public class ResumeController {

    private final CloudinaryService cloudinaryService;
    private final CandidateRepo candidateRepo;

    /**
     * Upload a new resume or replace existing one.
     * If the candidate already has a resume, the old file is deleted first.
     * File is named as {emailUsername}_{originalFileName}.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String email = authentication.getName();
        Candidate candidate = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        // If candidate already has a resume on Cloudinary, delete the old file
        String oldPublicId = candidate.getResumePublicId();
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            cloudinaryService.deleteResume(oldPublicId);
        }

        // Upload new resume
        Map<String, String> uploadResult = cloudinaryService.uploadResume(file, email);

        // Update candidate record
        candidate.setResumeUrl(uploadResult.get("url"));
        candidate.setResumePublicId(uploadResult.get("publicId"));
        candidateRepo.save(candidate);
        // log.info("Upload Result: {}", uploadResult);
        System.out.println("Upload Result : {} " + uploadResult);

        // Extract original file name from the uploaded file
        String originalFileName = file.getOriginalFilename();

        return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded successfully",
                "url", uploadResult.get("url"),
                "publicId", uploadResult.get("publicId"),
                "fileName", originalFileName != null ? originalFileName : "resume"
        ));
    }

    /**
     * Delete the candidate's resume from Cloudinary and clear the profile.
     */
    @DeleteMapping
    @Transactional
    public ResponseEntity<?> deleteResume(Authentication authentication) {
        String email = authentication.getName();
        Candidate candidate = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        String publicId = candidate.getResumePublicId();
        if (publicId == null || publicId.isBlank()) {
            return ResponseEntity.ok(Map.of("message", "No resume to delete"));
        }

        boolean deleted = cloudinaryService.deleteResume(publicId);

        // Clear resume fields regardless of Cloudinary result (prevents stale references)
        candidate.setResumeUrl(null);
        candidate.setResumePublicId(null);
        candidateRepo.save(candidate);

        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } else {
            return ResponseEntity.ok(Map.of(
                    "message", "Resume reference cleared (Cloudinary file may not have been found)",
                    "warning", true
            ));
        }
    }

    /**
     * Get resume info (URL and public ID) for the authenticated candidate.
     */
    @GetMapping
    public ResponseEntity<?> getResume(Authentication authentication) {
        String email = authentication.getName();
        Candidate candidate = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        String url = candidate.getResumeUrl();
        String publicId = candidate.getResumePublicId();

        if (url == null || url.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "hasResume", false,
                    "message", "No resume uploaded"
            ));
        }

        // Extract file name from publicId: "folder/uuid_filename.ext" -> "filename.ext"
        // Uses first underscore after the folder path (UUID never contains underscores)
        String fileName = null;
        if (publicId != null && publicId.contains("/") && publicId.contains("_")) {
            String idPart = publicId.substring(publicId.lastIndexOf("/") + 1);
            int underscoreIdx = idPart.indexOf("_");
            if (underscoreIdx >= 0) {
                fileName = idPart.substring(underscoreIdx + 1);
            }
        }

        return ResponseEntity.ok(Map.of(
                "hasResume", true,
                "url", url,
                "publicId", publicId,
                "fileName", fileName != null ? fileName : "resume"
        ));
    }

    /**
     * Get the download URL for the resume.
     * Returns the Cloudinary URL with ?fl_attachment=true so the browser
     * forces a download when the user navigates to it.
     * Uses the stored resumeUrl directly (from Cloudinary upload response)
     * rather than regenerating — this guarantees the URL is correct.
     */
    @GetMapping("/download")
    public ResponseEntity<?> downloadResume(Authentication authentication) {

        String email = authentication.getName();

        Candidate candidate = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        return ResponseEntity.ok(
                Map.of("downloadUrl", candidate.getResumeUrl())
        );
    }
}
