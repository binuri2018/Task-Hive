package com.example.Backend.controller;

import com.example.Backend.model.Comment;
import com.example.Backend.model.Like;
import com.example.Backend.model.LearningPlan;
import com.example.Backend.service.LearningPlanService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plan")
@CrossOrigin(origins = "*")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    // Create a learning plan for a specific user
    @PostMapping("/user/{userId}")
    public ResponseEntity<LearningPlan> createLearningPlanForUser(
            @PathVariable String userId,
            @RequestBody LearningPlan learningPlan) {
        learningPlan.setUserId(userId);
        LearningPlan created = learningPlanService.createLearningPlan(learningPlan);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Get all learning plans
    @GetMapping
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans() {
        List<LearningPlan> plans = learningPlanService.getAllLearningPlans();
        return new ResponseEntity<>(plans, HttpStatus.OK);
    }

    // Get a learning plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        LearningPlan plan = learningPlanService.getLearningPlanById(id);
        return new ResponseEntity<>(plan, HttpStatus.OK);
    }

    // Get learning plans by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getLearningPlansByUserId(@PathVariable String userId) {
        List<LearningPlan> plans = learningPlanService.getLearningPlansByUserId(userId);
        return new ResponseEntity<>(plans, HttpStatus.OK);
    }

    // Update a learning plan
    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
            @PathVariable String id,
            @RequestBody LearningPlan learningPlan) {
        LearningPlan updated = learningPlanService.updateLearningPlan(id, learningPlan);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // Delete a learning plan
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        learningPlanService.deleteLearningPlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Add a comment to a learning plan
    @PostMapping("/{planId}/comments")
    public ResponseEntity<LearningPlan> addComment(
            @PathVariable String planId,
            @RequestBody Comment comment) {
        LearningPlan updated = learningPlanService.addComment(planId, comment);
        return new ResponseEntity<>(updated, HttpStatus.CREATED);
    }

    // Update a comment
    @PutMapping("/{planId}/comments/{commentId}")
    public ResponseEntity<LearningPlan> updateComment(
            @PathVariable String planId,
            @PathVariable String commentId,
            @RequestBody Comment comment) {
        LearningPlan updated = learningPlanService.updateComment(planId, commentId, comment);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // Delete a comment
    @DeleteMapping("/{planId}/comments/{commentId}")
    public ResponseEntity<LearningPlan> deleteComment(
            @PathVariable String planId,
            @PathVariable String commentId,
            @RequestParam String userId) {
        LearningPlan updated = learningPlanService.deleteComment(planId, commentId, userId);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // Add a like to a learning plan
    @PostMapping("/{planId}/likes")
    public ResponseEntity<LearningPlan> addLike(
            @PathVariable String planId,
            @RequestBody Like like) {
        LearningPlan updated = learningPlanService.addLike(planId, like);
        return new ResponseEntity<>(updated, HttpStatus.CREATED);
    }

    // Remove a like from a learning plan
    @DeleteMapping("/{planId}/likes/{userId}")
    public ResponseEntity<LearningPlan> removeLike(
            @PathVariable String planId,
            @PathVariable String userId) {
        LearningPlan updated = learningPlanService.removeLike(planId, userId);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }
}
