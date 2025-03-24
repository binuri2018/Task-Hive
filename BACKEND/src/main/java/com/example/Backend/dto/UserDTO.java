package com.example.Backend.dto;

import com.example.Backend.enums.RegistrationSource;
import com.example.Backend.model.User;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

public class UserDTO {
    private String id;

    private String name;

    private String email;

    private String profileImage;

    private RegistrationSource registrationSource;

    private List<String> followingUsers;

    private List<String> followedUsers;

    private List<String> createdAt;

    public List<String> getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(List<String> createdAt) {
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }



    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public RegistrationSource getRegistrationSource() {
        return registrationSource;
    }

    public void setRegistrationSource(RegistrationSource registrationSource) {
        this.registrationSource = registrationSource;
    }

    public List<String> getFollowingUsers() {
        return followingUsers;
    }

    public void setFollowingUsers(List<String> followingUsers) {
        this.followingUsers = followingUsers;
    }

    public List<String> getFollowedUsers() {
        return followedUsers;
    }

    public void setFollowedUsers(List<String> followedUsers) {
        this.followedUsers = followedUsers;
    }


}
