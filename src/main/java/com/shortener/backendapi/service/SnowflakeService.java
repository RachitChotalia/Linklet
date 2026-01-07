package com.shortener.backendapi.service; // <--- MUST MATCH UrlService's package

import org.springframework.stereotype.Service;
import java.net.NetworkInterface;
import java.security.SecureRandom;
import java.time.Instant;

@Service
public class SnowflakeService {
    
    // Configuration: 41 bits timestamp | 10 bits machine ID | 12 bits sequence
    private static final int NODE_ID_BITS = 10;
    private static final int SEQUENCE_BITS = 12;

    private static final long maxNodeId = (1L << NODE_ID_BITS) - 1;
    private static final long maxSequence = (1L << SEQUENCE_BITS) - 1;

    // Custom Epoch (Jan 1, 2024)
    private static final long CUSTOM_EPOCH = 1704067200000L;

    private final long nodeId;
    private volatile long lastTimestamp = -1L;
    private volatile long sequence = 0L;

    public SnowflakeService() {
        this.nodeId = createNodeId();
        System.out.println("Snowflake Initialized with Node ID: " + this.nodeId);
    }

    public synchronized long nextId() {
        long currentTimestamp = timestamp();

        if (currentTimestamp < lastTimestamp) {
            throw new IllegalStateException("Clock moved backwards!");
        }

        if (currentTimestamp == lastTimestamp) {
            sequence = (sequence + 1) & maxSequence;
            if (sequence == 0) {
                currentTimestamp = waitNextMillis(currentTimestamp);
            }
        } else {
            sequence = 0;
        }

        lastTimestamp = currentTimestamp;

        return ((currentTimestamp - CUSTOM_EPOCH) << (NODE_ID_BITS + SEQUENCE_BITS))
                | (nodeId << SEQUENCE_BITS)
                | sequence;
    }

    private long timestamp() {
        return Instant.now().toEpochMilli();
    }

    private long waitNextMillis(long currentTimestamp) {
        while (currentTimestamp == lastTimestamp) {
            currentTimestamp = timestamp();
        }
        return currentTimestamp;
    }

    private long createNodeId() {
        try {
            return new SecureRandom().nextInt((int)maxNodeId) & maxNodeId;
        } catch (Exception ex) {
            return 1;
        }
    }
}