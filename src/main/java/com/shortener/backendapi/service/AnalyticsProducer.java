package com.shortener.backendapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsProducer {

    private static final String TOPIC = "link-clicks";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendClickEvent(String shortCode, String ipAddress, String userAgent) {
        String message = String.format(
            "{\"shortCode\":\"%s\", \"ip\":\"%s\", \"ua\":\"%s\", \"timestamp\":%d}",
            shortCode, ipAddress, userAgent, System.currentTimeMillis()
        );

        // Async send with callback to prevent crashing
        kafkaTemplate.send(TOPIC, shortCode, message).whenComplete((result, ex) -> {
            if (ex != null) {
                System.err.println("⚠️ KAFKA ERROR: Could not send analytics. Is Kafka running? " + ex.getMessage());
            } else {
                System.out.println("🚀 Sent to Kafka: " + message);
            }
        });
    }
}