package com.example.backend.services.impl;

import com.example.backend.entities.TestEntity;
import com.example.backend.services.apis.TestService;
import org.springframework.stereotype.Service;

@Service
public class TestServiceImpl implements TestService {

    @Override
    public TestEntity getTestEntity() {
        TestEntity testEntity = new TestEntity();
        testEntity.setAttr("test");
        return testEntity;
    }
}
