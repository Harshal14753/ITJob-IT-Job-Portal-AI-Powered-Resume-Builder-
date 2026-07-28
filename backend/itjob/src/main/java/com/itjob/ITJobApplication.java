package com.itjob;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ITJobApplication {

    public static void main(String[] args) {
        SpringApplication.run(ITJobApplication.class, args);
    }

}
