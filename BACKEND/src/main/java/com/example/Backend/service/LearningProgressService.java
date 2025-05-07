package com.example.Backend.service;

import com.example.Backend.model.Comment;
import com.example.Backend.model.LearningProgress;
import com.example.Backend.model.Like;
import com.example.Backend.repository.LearningProgressRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LearningProgressService {


    private final LearningProgressRepository learningProgressRepository;
    private final NotificationService notificationService;

    public LearningProgressService(LearningProgressRepository learningProgressRepository, NotificationService notificationService) {
        this.learningProgressRepository = learningProgressRepository;
        this.notificationService = notificationService;
    }

    //create a new learning progress entry
    public LearningProgress createLearningProgress(LearningProgress progress) {
        if (progress.getUserId() == null || progress.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (progress.getUserName() == null || progress.getUserName().isEmpty()) {
            progress.setUserName("Unknown User");
        }
        if (progress.getTemplateType() == null || progress.getTemplateType().isEmpty()) {
            throw new IllegalArgumentException("Template type is required");
        }

        //validate required fields based on template type
        switch (progress.getTemplateType()) {
            case "general":
                if (progress.getTitle() == null || progress.getTitle().isEmpty() ||
                        progress.getDescription() == null || progress.getDescription().isEmpty()) {
                    throw new IllegalArgumentException("Title and description are required for general template");
                }
                break;
            case "tutorial":
                if (progress.getTitle() == null || progress.getTitle().isEmpty() ||
                        progress.getTutorialName() == null || progress.getTutorialName().isEmpty()) {
                    throw new IllegalArgumentException("Title and tutorial name are required for tutorial template");
                }
                break;
            case "project":
                if (progress.getTitle() == null || progress.getTitle().isEmpty() ||
                        progress.getProjectName() == null || progress.getProjectName().isEmpty()) {
                    throw new IllegalArgumentException("Title and project name are required for project template");
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid template type");
        }

        progress.setCreatedAt(new Date());
        progress.setUpdatedAt(new Date());
        progress.setLikes(new ArrayList<>());
        progress.setComments(new ArrayList<>());
        return learningProgressRepository.save(progress);
    }

    //get all learning progress entries
    public List<LearningProgress> getAllLearningProgress() {
        return learningProgressRepository.findAllByOrderByCreatedAtDesc();
    }

    //get a learning progress entry by ID
    public LearningProgress getLearningProgressById(String id) {
        return learningProgressRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Learning progress not found"));
    }

    //get entries by user ID
    public List<LearningProgress> getLearningProgressByUserId(String userId) {
        return learningProgressRepository.findByUserId(userId);
    }

    //update learning progress entry
    public LearningProgress updateLearningProgress(String id, LearningProgress progressDetails) {
        LearningProgress progress = getLearningProgressById(id);
        progress.setTitle(progressDetails.getTitle());
        progress.setDescription(progressDetails.getDescription());
        progress.setTemplateType(progressDetails.getTemplateType());
        progress.setStatus(progressDetails.getStatus());
        progress.setTutorialName(progressDetails.getTutorialName());
        progress.setProjectName(progressDetails.getProjectName());
        progress.setSkillsLearned(progressDetails.getSkillsLearned());
        progress.setChallenges(progressDetails.getChallenges());
        progress.setNextSteps(progressDetails.getNextSteps());
        progress.setUpdatedAt(new Date());
        return learningProgressRepository.save(progress);
    }

    //delete learning progress entry
    public void deleteLearningProgress(String id) {
        LearningProgress progress = getLearningProgressById(id);
        learningProgressRepository.delete(progress);
    }

    //add comment
    public LearningProgress addComment(String entryId, Comment comment) {
        LearningProgress progress = getLearningProgressById(entryId);
        if (progress.getComments() == null) {
            progress.setComments(new ArrayList<>());
        }
        if (comment.getUserName() == null || comment.getUserName().isEmpty()) {
            comment.setUserName("Unknown User");
        }
        comment.setId(UUID.randomUUID().toString());
        comment.setCreatedAt(new Date());
        comment.setUpdatedAt(new Date());
        progress.getComments().add(comment);
        if (!progress.getUserId().equals(comment.getUserId())) {
            notificationService.createCommentNotification(entryId, progress.getUserId(), comment.getUserId(),
                    comment.getContent());
        }
        return learningProgressRepository.save(progress);
    }

    //update comment
    public LearningProgress updateComment(String entryId, String commentId, Comment commentDetails) {
        LearningProgress progress = getLearningProgressById(entryId);
        progress.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .ifPresent(c -> {
                    c.setContent(commentDetails.getContent());
                    c.setUpdatedAt(new Date());
                });
        return learningProgressRepository.save(progress);
    }

    //delete comment
    public LearningProgress deleteComment(String entryId, String commentId, String userId) {
        LearningProgress progress = getLearningProgressById(entryId);
        boolean isOwner = progress.getUserId().equals(userId);
        progress.setComments(progress.getComments().stream()
                .filter(c -> !(c.getId().equals(commentId) && (c.getUserId().equals(userId) || isOwner)))
                .collect(Collectors.toList()));
        return learningProgressRepository.save(progress);
    }

    //add like
    public LearningProgress addLike(String entryId, Like like) {
        LearningProgress progress = getLearningProgressById(entryId);
        if (progress.getLikes() == null) {
            progress.setLikes(new ArrayList<>());
        }
        boolean alreadyLiked = progress.getLikes().stream()
                .anyMatch(l -> l.getUserId().equals(like.getUserId()));

        if (!alreadyLiked) {
            like.setCreatedAt(new Date());
            progress.getLikes().add(like);
            // Trigger notification if liker is not the post owner
            if (!progress.getUserId().equals(like.getUserId())) {
                notificationService.createLikeNotification(entryId, progress.getUserId(), like.getUserId());
            }
            return learningProgressRepository.save(progress);
        }
        return progress;
    }

    //remove like
    public LearningProgress removeLike(String entryId, String userId) {
        LearningProgress progress = getLearningProgressById(entryId);
        progress.setLikes(progress.getLikes().stream()
                .filter(like -> !like.getUserId().equals(userId))
                .collect(Collectors.toList()));
        return learningProgressRepository.save(progress);
    }
}
