import axios from "axios";

//create axios instance with default config
const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    
    timeout: 60000, 
  });

  return apiClient;
};
//create post
export const createPost = async (userId, postData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/posts/user/${userId}`, postData);
};

//get all posts
export const getAllPosts = async (token) => {
  const apiClient = createApiClient(token);
  return apiClient.get("/posts");
};

//get post by id
export const getPostById = async (postId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/posts/${postId}`);
};

//get posts by user id
export const getPostsByUserId = async (userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/posts/user/${userId}`);
};

//update post
export const updatePost = async (postId, postData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/posts/${postId}`, postData);
};

//delete post
export const deletePost = async (postId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/posts/${postId}`);
};

//add like
export const addLike = async (postId, likeData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/posts/${postId}/likes`, likeData);
};

//remove like
export const removeLike = async (postId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/posts/${postId}/likes/${userId}`);
};

//add comment
export const addComment = async (postId, commentData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/posts/${postId}/comments`, commentData);
};

//update comment
export const updateComment = async (postId, commentId, commentData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/posts/${postId}/comments/${commentId}`, commentData);
};

//delete comment
export const deleteComment = async (postId, commentId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(
    `/posts/${postId}/comments/${commentId}?userId=${userId}`
  );
};

// // File upload API
export const uploadMedia = async (files, token) => {
  const apiClient = createApiClient(token);
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiClient.post("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
