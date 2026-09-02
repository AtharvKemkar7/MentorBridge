package com.alumni.platform.mentorship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EntityScan("com.alumni.platform.mentorship.entity")
@EnableJpaRepositories("com.alumni.platform.mentorship.repository")
@ComponentScan("com.alumni.platform.mentorship")
@EnableTransactionManagement
@EnableAsync
public class MentorshipServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MentorshipServiceApplication.class, args);
    }
}