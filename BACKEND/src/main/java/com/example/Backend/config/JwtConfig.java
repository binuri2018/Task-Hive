package com.example.Backend.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.Key;

@Configuration
public class JwtConfig {
    @Value("${jwt.secret:aslsdadadq9iqpweipqowie293i112313sdadadadqweqe1smgs90329109310}")
    private String secretKeyString;

    @Bean
    public Key jwtSecretKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }
}
