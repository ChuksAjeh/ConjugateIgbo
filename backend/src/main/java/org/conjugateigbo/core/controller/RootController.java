package org.conjugateigbo.core.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/")
@RestController
public class RootController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RootController.class);

    @GetMapping()
    public String sayHello() {
        LOGGER.info("Hello world greeting endpoint hit");
        String response = "Hello World!";
        LOGGER.info("Successful response: {}", response);
        return response;
    }
}