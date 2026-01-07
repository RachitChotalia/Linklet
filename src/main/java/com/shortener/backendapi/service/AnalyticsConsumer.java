package com.shortener.backendapi.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Timestamp;

@Service
public class AnalyticsConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // We use a direct connection to ClickHouse to avoid conflict with Postgres
    private static final String DB_URL = "jdbc:clickhouse://localhost:8123/default";

    @KafkaListener(topics = "link-clicks", groupId = "analytics-group")
    public void consume(String message) {
        try {
            System.out.println("📥 Consumed: " + message);

            // 1. Parse the JSON message
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            String shortCode = (String) data.get("shortCode");
            String ip = (String) data.get("ip");
            String ua = (String) data.get("ua");
            long ts = ((Number) data.get("timestamp")).longValue();

            // 2. Insert into ClickHouse
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 PreparedStatement ps = conn.prepareStatement("INSERT INTO clicks (short_code, ip, ua, timestamp) VALUES (?, ?, ?, ?)")) {
                
                ps.setString(1, shortCode);
                ps.setString(2, ip);
                ps.setString(3, ua);
                ps.setTimestamp(4, new Timestamp(ts));
                
                ps.executeUpdate();
                System.out.println("✅ Saved to ClickHouse!");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}