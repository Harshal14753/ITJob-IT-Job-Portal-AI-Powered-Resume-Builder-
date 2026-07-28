package com.itjob.config;

import java.io.InputStream;

import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ResumeTextExtractor {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {

        try (InputStream inputStream = file.getInputStream()) {

            return tika.parseToString(inputStream);

        } catch (Exception e) {

            throw new RuntimeException("Unable to read resume file.", e);

        }
    }

}
