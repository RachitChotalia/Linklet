package com.shortener.backendapi.controller;

import com.shortener.backendapi.service.AnalyticsProducer;
import com.shortener.backendapi.service.UrlService;
import jakarta.servlet.http.HttpServletRequest; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.net.URI;

@RestController
public class RedirectController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private AnalyticsProducer analyticsProducer; 

    // GET http://localhost:8081/{shortCode}
    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode, HttpServletRequest request) {
        
        // 1. Get the original URL (Checks Redis first, then DB)
        String longUrl = urlService.getOriginalUrl(shortCode);

        if (longUrl == null) {
            return ResponseEntity.notFound().build();
        }

       
        
         String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        try {
             analyticsProducer.sendClickEvent(shortCode, ipAddress, userAgent);
        } catch (Exception e) {
             System.out.println("Analytics failed (Kafka missing), but redirecting anyway.");
        }
        

        // 3. Redirect the User (302 Found)
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(longUrl))
                .build();
    }
}