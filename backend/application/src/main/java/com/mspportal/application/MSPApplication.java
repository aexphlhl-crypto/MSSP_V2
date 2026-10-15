package com.mspportal.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.mspportal")
@EnableJpaRepositories(basePackages = "com.mspportal")
@EntityScan(basePackages = "com.mspportal")
@EnableScheduling
public class MSPApplication {
    public static void main(String[] args) {
        SpringApplication.run(MSPApplication.class, args);
    }
}
