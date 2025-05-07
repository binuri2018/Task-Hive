package com.example.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.model.Comment;
import com.example.Backend.model.Like;
import com.example.Backend.model.Post;
import com.example.Backend.service.PostService;

// PostController.java
@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {
    @Autowired
    private PostService postService;

    // Create a post for a specific user
    @PostMapping("/user/{userId}")
    public ResponseEntity<Post> createPostForUser(@PathVariable String userId, @RequestBody Post post) {
        post.setUserId(userId);
        Post createdPost = postService.createPost(post);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    // get all posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Get a post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        Post post = postService.getPostById(id);
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    // Get posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        Post updatedPost = postService.updatePost(id, post);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Add a comment to a post
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Post> addComment(@PathVariable String postId, @RequestBody Comment comment) {
        Post updatedPost = postService.addComment(postId, comment);
        return new ResponseEntity<>(updatedPost, HttpStatus.CREATED);
    }

    // Update a comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Post> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Comment comment) {
        Post updatedPost = postService.updateComment(postId, commentId, comment);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }

    // Delete a comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Post> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userId) {
        Post updatedPost = postService.deleteComment(postId, commentId, userId);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }

    // Add a like to a post
    @PostMapping("/{postId}/likes")
    public ResponseEntity<Post> addLike(@PathVariable String postId, @RequestBody Like like) {
        Post updatedPost = postService.addLike(postId, like);
        return new ResponseEntity<>(updatedPost, HttpStatus.CREATED);
    }

    // Remove a like from a post
    @DeleteMapping("/{postId}/likes/{userId}")
    public ResponseEntity<Post> removeLike(@PathVariable String postId, @PathVariable String userId) {
        Post updatedPost = postService.removeLike(postId, userId);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }
}