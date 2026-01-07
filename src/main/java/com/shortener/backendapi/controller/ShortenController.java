package com.shortener.backendapi.controller;

import com.shortener.backendapi.model.Url;
import com.shortener.backendapi.model.User;
import com.shortener.backendapi.repository.UrlRepository;
import com.shortener.backendapi.repository.UserRepository;
import com.shortener.backendapi.service.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ShortenController {

    @Autowired private UrlService urlService;
    @Autowired private UrlRepository urlRepository; // Direct access for simplicity
    @Autowired private UserRepository userRepository;

    // POST: Create Link (Now with User ID support)
    @PostMapping("/shorten")
    public ResponseEntity<Map<String, String>> shorten(@RequestBody Map<String, String> request) {
        String longUrl = request.get("url");
        if (longUrl == null || longUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }

        // 1. Create the link logic (UrlService logic embedded here to access Entity)
        String shortCode = urlService.shortenUrl(longUrl);
        
        // 2. If user is logged in, update the Entity with their ID
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null) {
                // We need to fetch the entity created by service to update the user ID
                // (Optimized approach: In a real app, service should handle this, 
                // but we are patching it here for quick resume integration)
                Url urlEntity = urlRepository.findByShortCode(shortCode).orElse(null);
                if (urlEntity != null) {
                    urlEntity.setUserId(user.getId());
                    urlRepository.save(urlEntity);
                }
            }
        }

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return ResponseEntity.ok(Map.of(
            "shortCode", shortCode,
            "redirectUrl", baseUrl + "/" + shortCode
        ));
    }

    // NEW: GET History
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Url> urls = urlRepository.findByUserIdOrderByCreatedDateDesc(user.getId());

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();

        // Convert to clean JSON
        List<Map<String, Object>> response = urls.stream().map(url -> Map.of(
            "id", (Object) url.getId(),
            "original", url.getLongUrl(),
            "shortCode", url.getShortCode(),
            "shortUrl", "linklet.sh/" + url.getShortCode(),
            "realUrl", baseUrl + "/" + url.getShortCode(),
            "copied", false
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}