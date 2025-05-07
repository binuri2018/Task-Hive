import axios from "axios";

// Create axios instance with default config
const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 60000, // 60 seconds
  });

  return apiClient;
};

// Get all learning goals for a user
export const getUserLearningGoals = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/user/${userId}/learning-goals`);
    return response.data;
  } catch (error) {
    console.error("Error fetching learning goals:", error);
    throw error;
  }
};

// Add a new learning goal
export const addLearningGoal = async (userId, goalData, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.post(`/user/${userId}/learning-goals`, goalData);
    return response.data;
  } catch (error) {
    console.error("Error adding learning goal:", error);
    throw error;
  }
};

// Update a learning goal
export const updateLearningGoal = async (userId, goalId, goalData, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.put(
      `/user/${userId}/learning-goals/${goalId}`,
      goalData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating learning goal:", error);
    throw error;
  }
};

// Delete a learning goal
export const deleteLearningGoal = async (userId, goalId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.delete(
      `/user/${userId}/learning-goals/${goalId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting learning goal:", error);
    throw error;
  }
};


// Update learning goal progress
export const updateLearningGoalProgress = async (userId, goalId, progressData, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.patch(
      `/user/${userId}/learning-goals/${goalId}/progress`,
      progressData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating learning goal progress:", error);
    throw error;
  }
};


// Mark learning goal as complete/incomplete
export const toggleLearningGoalCompletion = async (userId, goalId, isCompleted, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.patch(
      `/user/${userId}/learning-goals/${goalId}/completion`,
      { completed: isCompleted }
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling learning goal completion:", error);
    throw error;
  }
};

// Update all learning goals (bulk update)
export const updateAllLearningGoals = async (userId, goalsData, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.put(
      `/user/${userId}/learning-goals`,
      { learningGoals: goalsData }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating all learning goals:", error);
    throw error;
  }
}; 