package com.ssafy.ttomanito.domain.health.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public String healthCheck() {

        int num=2;

        return "OK health check" + num;
    }
}
