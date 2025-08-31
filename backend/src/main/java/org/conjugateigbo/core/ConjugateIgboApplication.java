package org.conjugateigbo.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
//@EnableMongoRepositories(basePackages = "org.conjugateigbo.core")
public class ConjugateIgboApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConjugateIgboApplication.class, args);
    }
}
