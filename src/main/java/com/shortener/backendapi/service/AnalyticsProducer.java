package com.shortener.backendapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsProducer {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Use a simple Redis List as our "Topic"
    private static final String REDIS_QUEUE_KEY = "analytics_clicks";

    public void sendClickEvent(String shortCode, String ipAddress, String userAgent) {
        // 1. Create a simple data map
        Map<String, String> eventData = new HashMap<>();
        eventData.put("shortCode", shortCode);
        eventData.put("ipAddress", ipAddress);
        eventData.put("userAgent", userAgent);
        eventData.put("timestamp", String.valueOf(System.currentTimeMillis()));

        // 2. Convert to JSON String
        String jsonEvent;
        try {
            jsonEvent = new ObjectMapper().writeValueAsString(eventData);
        } catch (JsonProcessingException e) {
            System.err.println("Error serializing analytics event: " + e.getMessage());
            return;
        }

        // 3. Push to Redis (Left Push)
        // This acts exactly like a Kafka Producer: fire and forget.
        redisTemplate.opsForList().leftPush(REDIS_QUEUE_KEY, jsonEvent);
        
        System.out.println("✅ Event pushed to Redis Queue: " + shortCode);
    }
}