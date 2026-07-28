package com.itjob.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${app.cloudinary.upload-folder:itjob-portal/resumes}")
    private String uploadFolder;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (!cloudName.isEmpty() && !apiKey.isEmpty() && !apiSecret.isEmpty()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            log.info("Cloudinary configured from application.properties");
        } else {
            log.warn("Cloudinary credentials not found in application.properties — file uploads will fail");
        }
    }

    public Cloudinary getCloudinary() {
        if (cloudinary == null) {
            throw new IllegalStateException(
                    "Cloudinary is not configured. Please set app.cloudinary.* properties in application-dev.properties"
            );
        }
        return cloudinary;
    }

    public String getResumeFolder() {
        return uploadFolder;
    }
}
