package com.example.Backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningGoal {
    private String id;
    private String title;
    private String description;
    private Date targetDate;
    private int progressPercentage;
    private String category;
    private boolean completed;
    private Date createdAt;
    private Date updatedAt;
    
    // Constructor with essential fields
    public LearningGoal(String title, String description, Date targetDate, String category) {
        this.title = title;
        this.description = description;
        this.targetDate = targetDate;
        this.category = category;
        this.progressPercentage = 0;
        this.completed = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
} 