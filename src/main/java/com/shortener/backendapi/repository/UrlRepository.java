package com.shortener.backendapi.repository;

import com.shortener.backendapi.model.Url; // <--- Make sure this imports 'Url'
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// FIX: Change 'UrlEntity' to 'Url' inside the <> brackets
public interface UrlRepository extends JpaRepository<Url, Long> {
    
    // FIX: Return 'Optional<Url>'
    Optional<Url> findByShortCode(String shortCode);
    
    // FIX: Return 'List<Url>'
    List<Url> findByUserIdOrderByCreatedDateDesc(Long userId);
}