package com.example.Backend.repository;

import com.example.Backend.model.LearningProgress;
import com.example.Backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningProgressRepository extends MongoRepository<LearningProgress, String> {

    // Get all by userId
    List<LearningProgress> findByUserId(String userId);

    // Get all ordered by creation date descending
    List<LearningProgress> findAllByOrderByCreatedAtDesc();

    List<LearningProgress> findByUserIdOrderByCreatedAtDesc(String userId);
}
