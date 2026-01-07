package com.shortener.backendapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "urls")
@Data
public class Url {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String longUrl;

    @Column(nullable = false, unique = true)
    private String shortCode;

    // --- FIX: Map Java 'createdDate' to SQL 'created_at' ---
    @Column(name = "created_at", nullable = false) 
    private Timestamp createdDate;
    // -------------------------------------------------------

    @Column(name = "user_id")
    private Long userId; 
}