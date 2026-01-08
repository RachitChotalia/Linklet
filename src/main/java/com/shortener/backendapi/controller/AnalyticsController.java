package com.shortener.backendapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173") // Allows frontend access
public class AnalyticsController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Must match the key used in AnalyticsProducer.java
    private static final String REDIS_QUEUE_KEY = "analytics_clicks";
    
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/{shortCode}")
    public ResponseEntity<List<Map<String, Object>>> getStats(@PathVariable String shortCode) {
        // 1. Fetch all logs from Redis
        // (For a production app, we would use a different data structure, 
        // but for this fix, reading the list is perfectly fine and crash-proof)
        List<String> rawLogs = redisTemplate.opsForList().range(REDIS_QUEUE_KEY, 0, -1);

        if (rawLogs == null || rawLogs.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // 2. Filter logs in memory to find matches for this shortCode
        List<Map<String, Object>> stats = rawLogs.stream()
            .map(json -> {
                try {
                    // Convert JSON string back to Map
                    return (Map<String, Object>) mapper.readValue(json, Map.class);
                } catch (Exception e) {
                    return null;
                }
            })
            .filter(data -> data != null && shortCode.equals(data.get("shortCode")))
            .collect(Collectors.toList());

        return ResponseEntity.ok(stats);
    }
}