package com.shortener.backendapi.controller;

import org.springframework.web.bind.annotation.*;
import java.sql.*;
import java.util.*;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private static final String DB_URL = "jdbc:clickhouse://localhost:8123/default";

    @GetMapping("/{shortCode}")
    public List<Map<String, Object>> getStats(@PathVariable String shortCode) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        // This query groups clicks by Hour to show a timeline
        String query = """
            SELECT 
                formatDateTime(toStartOfHour(timestamp), '%H:00') as time_bucket, 
                count(*) as clicks 
            FROM clicks 
            WHERE short_code = ? 
            GROUP BY time_bucket 
            ORDER BY time_bucket
        """;

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, shortCode);
            
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("time", rs.getString("time_bucket"));
                    row.put("clicks", rs.getInt("clicks"));
                    results.add(row);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return results;
    }
}