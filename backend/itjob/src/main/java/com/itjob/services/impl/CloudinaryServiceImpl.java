package com.itjob.services.impl;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.itjob.config.CloudinaryConfig;
import com.itjob.services.CloudinaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final CloudinaryConfig cloudinaryConfig;

    @Override
    public Map<String, String> uploadResume(MultipartFile file, String email) {
        try {
            Cloudinary cloudinary = cloudinaryConfig.getCloudinary();
            String resumeFolder = cloudinaryConfig.getResumeFolder();

            // Generate public ID: {folder}/{UUID}_{originalFilename}
            String originalName = file.getOriginalFilename();
            String safeFileName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_") : "resume";
            String uuid = UUID.randomUUID().toString();
            String publicId = resumeFolder + "/" + uuid + "_" + safeFileName;

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "auto",
                            "overwrite", true
                    )
            );

            System.out.println("Cloudinary Upload Result : " + uploadResult);

            String url = (String) uploadResult.get("secure_url");
            // The public_id returned may not include folder prefix; use the full one we built
            String returnedPublicId = (String) uploadResult.get("public_id");

            log.info("Resume uploaded successfully. URL: {}, Public ID: {}", url, returnedPublicId);

            return Map.of(
                    "url", url != null ? url : "",
                    "publicId", returnedPublicId != null ? returnedPublicId : publicId
            );
        } catch (IOException e) {
            log.error("Failed to upload resume to Cloudinary", e);
            throw new RuntimeException("Failed to upload resume: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteResume(String publicId) {
        try {
            if (publicId == null || publicId.isBlank()) {
                log.warn("No public ID provided for deletion");
                return false;
            }

            Cloudinary cloudinary = cloudinaryConfig.getCloudinary();

            // Try 'raw' first (for DOC/DOCX), then 'image' (for PDF)
            // Cloudinary uses different resource types for different file formats
            for (String resourceType : new String[]{"raw", "image"}) {
                Map<?, ?> result = cloudinary.uploader().destroy(
                        publicId,
                        ObjectUtils.asMap("resource_type", resourceType)
                );
                String resultStatus = (String) result.get("result");
                if ("ok".equals(resultStatus)) {
                    log.info("Resume deleted successfully (type: {}). Public ID: {}", resourceType, publicId);
                    return true;
                }
            }

            log.warn("Resume deletion failed for public ID: {} — not found in 'raw' or 'image' types", publicId);
            return false;
        } catch (IOException e) {
            log.error("Failed to delete resume from Cloudinary", e);
            return false;
        }
    }


}
