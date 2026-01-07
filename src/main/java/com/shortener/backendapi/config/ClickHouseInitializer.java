package com.shortener.backendapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Component
public class ClickHouseInitializer implements CommandLineRunner {

    @Value("${clickhouse.url}")
    private String clickhouseUrl;

    @Override
    public void run(String... args) {
        System.out.println(">>> Initializing ClickHouse connection...");
        try {
            // 1. Load the Driver
            Class.forName("com.clickhouse.jdbc.ClickHouseDriver");

            // 2. Connect and Run SQL
            try (Connection conn = DriverManager.getConnection(clickhouseUrl);
                 Statement stmt = conn.createStatement()) {

                String sql = """
                    CREATE TABLE IF NOT EXISTS clicks (
                        short_code String,
                        timestamp DateTime,
                        referrer String,
                        user_agent String,
                        ip_address String
                    ) ENGINE = MergeTree()
                    ORDER BY (short_code, timestamp);
                """;

                stmt.execute(sql);
                System.out.println(">>> SUCCESS: ClickHouse 'clicks' table is ready.");
            }
        } catch (Exception e) {
            // We log the error but don't stop the app, just in case ClickHouse is warming up
            System.err.println(">>> WARNING: ClickHouse initialization failed: " + e.getMessage());
        }
    }
}