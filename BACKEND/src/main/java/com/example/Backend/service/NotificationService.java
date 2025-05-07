package com.example.Backend.service;

import com.example.Backend.model.Notification;
import com.example.Backend.model.User;
import com.example.Backend.repository.NotificationRepository;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createLikeNotification(String postId, String postOwnerId, String triggerUserId) {
        User triggerUser = userRepository.findById(triggerUserId)
                .orElseThrow(() -> new RuntimeException("Trigger user not found"));
        String message = triggerUser.getName() + " liked your post.";
        Notification notification = new Notification(postOwnerId, "LIKE", postId, triggerUserId, message);
        notificationRepository.save(notification);
    }

    public void createCommentNotification(String postId, String postOwnerId, String triggerUserId,
            String commentContent) {
        User triggerUser = userRepository.findById(triggerUserId)
                .orElseThrow(() -> new RuntimeException("Trigger user not found"));
        String message = triggerUser.getName() + " commented on your post: " + commentContent;
        Notification notification = new Notification(postOwnerId, "COMMENT", postId, triggerUserId, message);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    public void markNotificationAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}