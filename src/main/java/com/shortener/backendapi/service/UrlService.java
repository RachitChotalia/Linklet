package com.shortener.backendapi.service;

import com.shortener.backendapi.model.Url; // <--- Using the new class
import com.shortener.backendapi.repository.UrlRepository;
import com.shortener.backendapi.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;

@Service
public class UrlService {

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private SnowflakeIdGenerator snowflakeIdGenerator;

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Base62 characters for encoding
    private static final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public String shortenUrl(String longUrl) {
        // 1. Generate unique ID
        long id = snowflakeIdGenerator.nextId();

        // 2. Convert ID to Base62 (Short Code)
        String shortCode = encodeBase62(id);

        // 3. Save to Database (Using the new Url class)
        Url url = new Url();
        url.setLongUrl(longUrl);
        url.setShortCode(shortCode);
        url.setCreatedDate(new Timestamp(System.currentTimeMillis()));
        // Note: userId is handled in the Controller for now
        
        urlRepository.save(url);

        // 4. Cache in Redis (Key: shortCode, Value: longUrl)
        redisTemplate.opsForValue().set(shortCode, longUrl, 24, TimeUnit.HOURS);

        return shortCode;
    }

    public String getOriginalUrl(String shortCode) {
        // 1. Check Redis first (Fast!)
        String cachedUrl = redisTemplate.opsForValue().get(shortCode);
        if (cachedUrl != null) {
            return cachedUrl;
        }

        // 2. If not in Redis, check Database
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL not found"));

        // 3. Save back to Redis for next time
        redisTemplate.opsForValue().set(shortCode, url.getLongUrl(), 24, TimeUnit.HOURS);

        return url.getLongUrl();
    }

    private String encodeBase62(long id) {
        StringBuilder sb = new StringBuilder();
        while (id > 0) {
            sb.append(BASE62.charAt((int) (id % 62)));
            id /= 62;
        }
        return sb.reverse().toString();
    }
}