//user profile update dto
package com.example.Backend.dto;

import com.example.Backend.model.LearningGoal;
import jakarta.validation.constraints.Size;

import java.util.List;

public class ProfileUpdateDTO {
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @Size(max = 500, message = "Bio must be less than 500 characters")
    private String bio;

    private List<String> skills;

    private List<LearningGoal> learningGoals;

    @Size(max = 100, message = "Location must be less than 100 characters")
    private String location;

    private String profileImage;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<LearningGoal> getLearningGoals() {
        return learningGoals;
    }

    public void setLearningGoals(List<LearningGoal> learningGoals) {
        this.learningGoals = learningGoals;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
