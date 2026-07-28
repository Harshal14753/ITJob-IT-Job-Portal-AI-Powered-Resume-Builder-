package com.itjob;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.google.genai.Client;

@SpringBootTest
class itjobApplicationTests {

    @Test
    void contextLoads() {

        Client client = new Client();
    }

}
