package com.example.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Temporary controller for debugging OAuth issues
 * Add this to your backend project to help diagnose the OAuth flow
 */
@RestController
@RequestMapping("/api/debug")
public class OAuthDebugController {

    @GetMapping("/auth-info")
    public ResponseEntity<?> getAuthInfo() {
        Map<String, Object> response = new HashMap<>();
        
        // Get current authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            response.put("status", "No authentication found");
            return ResponseEntity.ok(response);
        }
        
        // Basic auth info
        response.put("authenticated", auth.isAuthenticated());
        response.put("type", auth.getClass().getName());
        response.put("name", auth.getName());
        
        // Principal info
        Object principal = auth.getPrincipal();
        if (principal != null) {
            response.put("principalType", principal.getClass().getName());
            response.put("principalToString", principal.toString());
        } else {
            response.put("principal", "null");
        }
        
        // Authorities
        response.put("authorities", auth.getAuthorities());
        
        // Details
        if (auth.getDetails() != null) {
            response.put("detailsType", auth.getDetails().getClass().getName());
        }
        
        return ResponseEntity.ok(response);
    }
} 