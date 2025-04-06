package com.example.Backend.model;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "learning_plan")
public class LearningPlan {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String title;
    private String description;
    private String topics;
    private String resources;
    private Date createdAt;
    private Date updatedAt;
    private List<Like> likes;
    private List<Comment> comments;

    // Getters, setters, constructors
    public LearningPlan() {
    }

    public LearningPlan(String id, String userId, String userName, String title, String description, String topics,
            String resources, Date createdAt, Date updatedAt, List<Like> likes, List<Comment> comments) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.title = title;
        this.description = description;
        this.topics = topics;
        this.resources = resources;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likes = likes;
        this.comments = comments;
    }

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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTopics() {
        return topics;
    }

    public void setTopics(String topics) {
        this.topics = topics;
    }

    public String getResources() {
        return resources;
    }

    public void setResources(String resources) {
        this.resources = resources;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Like> getLikes() {
        return likes;
    }

    public void setLikes(List<Like> likes) {
        this.likes = likes;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

}
