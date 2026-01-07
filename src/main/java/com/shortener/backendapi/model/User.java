package com.shortener.backendapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // We will use email as username

    @Column(nullable = false)
    private String password;
    
    private String role = "ROLE_USER";
    // ... existing fields ...

    @Column(name = "user_id")
    private Long userId; // This connects the link to a specific user

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}