package com.itjob.services;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    /**
     * Upload a resume file to Cloudinary.
     * The file is stored under the configured folder.
     * Public ID is generated as {emailUsername}_{originalFilename}.
     *
     * @param file    the multipart file to upload
     * @param email   the candidate's email (used for naming)
     * @return map containing "url" and "publicId"
     */
    Map<String, String> uploadResume(MultipartFile file, String email);

    /**
     * Delete a resume from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public ID of the file to delete
     * @return true if deletion was successful
     */
    boolean deleteResume(String publicId);

}
