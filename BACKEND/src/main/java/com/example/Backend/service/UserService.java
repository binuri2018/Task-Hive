//User Services 
package com.example.Backend.service;

import com.example.Backend.dto.ProfileUpdateDTO;
import com.example.Backend.dto.UserDTO;
import com.example.Backend.dto.UserProfileDTO;
import com.example.Backend.enums.RegistrationSource;
import com.example.Backend.model.LearningGoal;
import com.example.Backend.model.LearningPlan;
import com.example.Backend.model.LearningProgress;
import com.example.Backend.model.Post;
import com.example.Backend.model.User;
import com.example.Backend.repository.LearningPlanRepository;
import com.example.Backend.repository.LearningProgressRepository;
import com.example.Backend.repository.PostRepository;
import com.example.Backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LearningProgressRepository progressRepository;
    private final LearningPlanRepository planRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final long JWT_EXPIRATION = 86400000; // 24 hours in milliseconds
    private final Key jwtSecretKey;
    private final LearningProgressRepository learningProgressRepository;
    private final LearningPlanRepository learningPlanRepository;

    @Autowired
    public UserService(UserRepository userRepository, PostRepository postRepository, LearningProgressRepository progressRepository, LearningPlanRepository planRepository, BCryptPasswordEncoder bCryptPasswordEncoder, Key jwtSecretKey, LearningProgressRepository learningProgressRepository, LearningPlanService learningPlanService, LearningPlanRepository learningPlanRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.progressRepository = progressRepository;
        this.planRepository = planRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtSecretKey = jwtSecretKey;
        this.learningProgressRepository = learningProgressRepository;
        this.learningPlanRepository = learningPlanRepository;
    }

    public ResponseEntity<Object> createUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            if (user.getRegistrationSource() == RegistrationSource.GOOGLE) {
                return generateTokenResponse(existingUser.get());
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email already exists");
        }

        if (user.getRegistrationSource() == null) {
            user.setRegistrationSource(RegistrationSource.CREDENTIAL);
        }

        if (user.getRegistrationSource() == RegistrationSource.CREDENTIAL && user.getPassword() != null) {
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        }

        // Initialize lists if they're null
        if (user.getFollowingUsers() == null) {
            user.setFollowingUsers(new ArrayList<>());
        }

        if (user.getFollowedUsers() == null) {
            user.setFollowedUsers(new ArrayList<>());
        }

        if (user.getSkills() == null) {
            user.setSkills(new ArrayList<>());
        }

        try {
            User savedUser = userRepository.save(user);
            return generateTokenResponse(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create user: " + e.getMessage());
        }
    }

    public ResponseEntity<Object> loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User credentials are incorrect");
        }

        User foundUser = user.get();

        if (foundUser.getRegistrationSource() == RegistrationSource.GOOGLE && foundUser.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User credentials are incorrect");
        }

        //for credential users, validate password
        if (!bCryptPasswordEncoder.matches(password, foundUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        return generateTokenResponse(foundUser);
    }

    private ResponseEntity<Object> generateTokenResponse(User user) {
        String token = generateJwtToken(user);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", user.getId());
        responseMap.put("name", user.getName());
        responseMap.put("email", user.getEmail());
        responseMap.put("profileImage", user.getProfileImage());
        responseMap.put("token", token);
        responseMap.put("followingUsers", user.getFollowingUsers());
        responseMap.put("followedUsers", user.getFollowedUsers());

        return ResponseEntity.ok(responseMap);
    }

    private String generateJwtToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder().setSubject(user.getId()).claim("name", user.getName()).claim("email", user.getEmail()).setIssuedAt(now).setExpiration(expiryDate).signWith(jwtSecretKey).compact();
    }

    public String generateJwtTokenForOAuthUser(User user) {
        //check if user exists
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        User savedUser;

        if (existingUser.isPresent()) {
            // Update existing user
            User userToUpdate = existingUser.get();
            userToUpdate.setName(user.getName());
            userToUpdate.setProfileImage(user.getProfileImage());
            savedUser = userRepository.save(userToUpdate);
        } else {
            // Create new user
            if (user.getFollowingUsers() == null) {
                user.setFollowingUsers(new ArrayList<>());
            }

            if (user.getFollowedUsers() == null) {
                user.setFollowedUsers(new ArrayList<>());
            }

            if (user.getSkills() == null) {
                user.setSkills(new ArrayList<>());
            }

            savedUser = userRepository.save(user);
        }

        //generate token
        return generateJwtToken(savedUser);
    }

    //convert User to UserProfileDTO
    public UserProfileDTO convertToProfileDTO(User user) {
        UserProfileDTO profileDTO = new UserProfileDTO();

        profileDTO.setId(user.getId());
        profileDTO.setName(user.getName());
        profileDTO.setEmail(user.getEmail());
        profileDTO.setProfileImage(user.getProfileImage());
        profileDTO.setBio(user.getBio());
        profileDTO.setSkills(user.getSkills());
        profileDTO.setLocation(user.getLocation());
        profileDTO.setFollowingUsers(user.getFollowingUsers());
        profileDTO.setFollowedUsers(user.getFollowedUsers());
        profileDTO.setRegistrationSource(user.getRegistrationSource());
        profileDTO.setLearningGoals(user.getLearningGoals());

        return profileDTO;
    }

    //gt full user profile by ID
    public ResponseEntity<?> getUserProfile(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        UserProfileDTO profileDTO = convertToProfileDTO(user);

        return ResponseEntity.ok(profileDTO);
    }

    //get multiple users by IDs (for followers/following lists)
    public List<UserProfileDTO> getUsersByIds(List<String> userIds) {
        List<User> users = userRepository.findAllById(userIds);

        return users.stream().map(this::convertToProfileDTO).collect(Collectors.toList());
    }

    //update user profile
    public ResponseEntity<?> updateUserProfile(String userId, ProfileUpdateDTO profileDTO) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();


        if (profileDTO.getName() != null && !profileDTO.getName().trim().isEmpty()) {
            user.setName(profileDTO.getName());
        }

        if (profileDTO.getBio() != null) {
            user.setBio(profileDTO.getBio());
        }

        if (profileDTO.getSkills() != null) {
            user.setSkills(profileDTO.getSkills());
        }

        if (profileDTO.getLocation() != null) {
            user.setLocation(profileDTO.getLocation());
        }

        if (profileDTO.getProfileImage() != null) {
            user.setProfileImage(profileDTO.getProfileImage());
        }
        
        if (profileDTO.getLearningGoals() != null) {
            user.setLearningGoals(profileDTO.getLearningGoals());
        }

        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(convertToProfileDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile: " + e.getMessage());
        }
    }

    //follow user
    public ResponseEntity<?> followUser(String userId, String followerId) {
        Optional<User> targetUserOpt = userRepository.findById(userId);
        Optional<User> followerUserOpt = userRepository.findById(followerId);

        if (targetUserOpt.isEmpty() || followerUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User targetUser = targetUserOpt.get();
        User followerUser = followerUserOpt.get();

        //check if already following
        if (targetUser.getFollowedUsers().contains(followerId) || followerUser.getFollowingUsers().contains(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Already following this user");
        }

        //update follower lists
        targetUser.getFollowedUsers().add(followerId);
        followerUser.getFollowingUsers().add(userId);

        try {
            userRepository.save(targetUser);
            userRepository.save(followerUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully followed user");
            response.put("user", convertToProfileDTO(targetUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to follow user: " + e.getMessage());
        }
    }

    //unfollow user
    public ResponseEntity<?> unfollowUser(String userId, String followerId) {
        Optional<User> targetUserOpt = userRepository.findById(userId);
        Optional<User> followerUserOpt = userRepository.findById(followerId);

        if (targetUserOpt.isEmpty() || followerUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User targetUser = targetUserOpt.get();
        User followerUser = followerUserOpt.get();

        //remove from follower lists
        targetUser.getFollowedUsers().remove(followerId);
        followerUser.getFollowingUsers().remove(userId);

        try {
            userRepository.save(targetUser);
            userRepository.save(followerUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully unfollowed user");
            response.put("user", convertToProfileDTO(targetUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to unfollow user: " + e.getMessage());
        }
    }

    //ටet all content by user ID
    public ResponseEntity<?> getUserContent(String userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        try {
            List<Post> posts = postRepository.findByUserId(userId);
            List<LearningProgress> progress = progressRepository.findByUserId(userId);
            List<LearningPlan> plans = planRepository.findByUserId(userId);

            Map<String, Object> content = new HashMap<>();
            content.put("posts", posts);
            content.put("progress", progress);
            content.put("plans", plans);

            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve user content: " + e.getMessage());
        }
    }

    public Map<String, Integer> getUserTotalPostCount(String userId) {
        if (!userRepository.existsById(userId)) {
            return Collections.singletonMap("totalPosts", 0);
        }

        int skillSharingPosts = postRepository.findByUserId(userId).size();
        int learningProgressPosts = (int) learningProgressRepository.findByUserId(userId).size();
        int learningPlansPosts = (int) learningPlanRepository.findByUserId(userId).size();

        return Collections.singletonMap("totalPosts", skillSharingPosts + learningProgressPosts + learningPlansPosts);
    }

    // Learning Goals methods
    
    public ResponseEntity<?> getUserLearningGoals(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        return ResponseEntity.ok(user.getLearningGoals());
    }
    
    public ResponseEntity<?> addLearningGoal(String userId, LearningGoal learningGoal) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        
        // Initialize learning goals list if null
        if (user.getLearningGoals() == null) {
            user.setLearningGoals(new ArrayList<>());
        }
        
        // Add the new learning goal
        user.getLearningGoals().add(learningGoal);
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add learning goal: " + e.getMessage());
        }
    }
    
    public ResponseEntity<?> updateLearningGoal(String userId, String goalId, LearningGoal updatedGoal) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        List<LearningGoal> goals = user.getLearningGoals();
        
        if (goals == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No learning goals found for this user");
        }
        
        // Find the goal to update
        boolean goalFound = false;
        for (int i = 0; i < goals.size(); i++) {
            LearningGoal goal = goals.get(i);
            if (goal.getId().equals(goalId)) {
                // Preserve the original ID
                updatedGoal.setId(goalId);
                goals.set(i, updatedGoal);
                goalFound = true;
                break;
            }
        }
        
        if (!goalFound) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Learning goal not found");
        }
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update learning goal: " + e.getMessage());
        }
    }
    
    public ResponseEntity<?> deleteLearningGoal(String userId, String goalId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        List<LearningGoal> goals = user.getLearningGoals();
        
        if (goals == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No learning goals found for this user");
        }
        
        // Find and remove the goal
        boolean removed = goals.removeIf(goal -> goal.getId().equals(goalId));
        
        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Learning goal not found");
        }
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete learning goal: " + e.getMessage());
        }
    }
    
    public ResponseEntity<?> updateLearningGoalProgress(String userId, String goalId, Integer progressPercentage) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        List<LearningGoal> goals = user.getLearningGoals();
        
        if (goals == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No learning goals found for this user");
        }
        
        // Find the goal to update
        boolean goalFound = false;
        for (LearningGoal goal : goals) {
            if (goal.getId().equals(goalId)) {
                goal.setProgressPercentage(progressPercentage);
                goal.setUpdatedAt(new Date());
                
                // If progress is 100%, mark as completed
                if (progressPercentage == 100) {
                    goal.setCompleted(true);
                }
                
                goalFound = true;
                break;
            }
        }
        
        if (!goalFound) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Learning goal not found");
        }
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update learning goal progress: " + e.getMessage());
        }
    }
    
    public ResponseEntity<?> toggleLearningGoalCompletion(String userId, String goalId, Boolean completed) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        List<LearningGoal> goals = user.getLearningGoals();
        
        if (goals == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No learning goals found for this user");
        }
        
        // Find the goal to update
        boolean goalFound = false;
        for (LearningGoal goal : goals) {
            if (goal.getId().equals(goalId)) {
                goal.setCompleted(completed);
                goal.setUpdatedAt(new Date());
                
                // If completed, set progress to 100%
                if (completed) {
                    goal.setProgressPercentage(100);
                }
                
                goalFound = true;
                break;
            }
        }
        
        if (!goalFound) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Learning goal not found");
        }
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update learning goal completion status: " + e.getMessage());
        }
    }
    
    public ResponseEntity<?> updateAllLearningGoals(String userId, List<LearningGoal> learningGoals) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        user.setLearningGoals(learningGoals);
        
        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser.getLearningGoals());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update learning goals: " + e.getMessage());
        }
    }
}