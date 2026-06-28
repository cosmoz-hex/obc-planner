package com.example.backend.controllers;

import com.example.backend.entities.TestEntity;
import com.example.backend.services.apis.TestService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@AllArgsConstructor
public class TestController {

    private final TestService testService;

    @GetMapping("")
    public TestEntity test(){
        return testService.getTestEntity();
    }
}
