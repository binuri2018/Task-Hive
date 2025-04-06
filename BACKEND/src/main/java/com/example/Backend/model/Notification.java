package com.example.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String type;
    private String postId;
    private String triggerUserId;
    private String message;
    private boolean read;
    private Date createdAt;

    public Notification() {
    }

    public Notification(String userId, String type, String postId, String triggerUserId, String message) {
        this.userId = userId;
        this.type = type;
        this.postId = postId;
        this.triggerUserId = triggerUserId;
        this.message = message;
        this.read = false;
        this.createdAt = new Date();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getTriggerUserId() {
        return triggerUserId;
    }

    public void setTriggerUserId(String triggerUserId) {
        this.triggerUserId = triggerUserId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}