import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Edit, Trash, Share2, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Comment, { CommentForm } from "./CommentComponent";
import useConfirmModal from "../hooks/useConfirmModal";
import EditPostModal from "./EditSkillPostModal";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";
import ConfirmModal from "./ConfirmModal.jsx";

const SkillSharingCard = ({
                            post,
                            currentUser,
                            onLike,
                            onDelete,
                            onComment,
                            onCommentUpdated,
                            onCommentDeleted,
                            token,
                          }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const isLikedByUser = post?.likes?.some(
      (like) => like.userId === currentUser?.id
  );

  const isOwner = post?.userId === currentUser?.id;

  const handleUserClick = () => {
    navigate(`/profile/${post.userId}`);
  };

  // Handle adding a comment through parent component
  const handleAddComment = async (postId, commentData) => {
    try {
      return await onComment(postId, commentData);
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  // Handle updating a comment through parent component
  const handleCommentUpdated = (postId, commentId, newContent) => {
    onCommentUpdated(postId, commentId, newContent);
  };

  // Handle deleting a comment through parent component
  const handleCommentDeleted = (postId, commentId) => {
    onCommentDeleted(postId, commentId);
  };

  // Handle post update - just close modal and notify parent
  const handlePostUpdated = () => {
    setShowEditModal(false);
    onDelete(post.id, true);
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? "Post removed from saved items" : "Post saved successfully");
  };

  const handleShare = () => {
    setShared(true);
    navigator.clipboard.writeText(`Check out this skill post: ${window.location.origin}/post/${post.id}`);
    toast.success("Link copied to clipboard");

    setTimeout(() => {
      setShared(false);
    }, 2000);
  };

  return (
      <motion.div
          className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{
            y: -5,
            transition: { duration: 0.2 },
          }}
      >
        {/* Post Header with User Info and Action Buttons */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleUserClick}
          >
            <UserAvatar
                src={post.userProfileImage}
                alt={post.userName}
                name={post.userName}
                size="h-10 w-10"
            />
            <div>
              <h3 className="font-medium text-white hover:text-yellow-400 transition-colors">{post.userName}</h3>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Post Owner Actions */}
          {isOwner && (
              <div className="flex space-x-2">
                <motion.button
                    onClick={() => setShowEditModal(true)}
                    className="text-gray-400 hover:text-yellow-400 p-1.5 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Edit post"
                >
                  <Edit size={16} />
                </motion.button>
                <motion.button
                    onClick={() => {
                      openModal({
                        title: "Delete Post",
                        message:
                            "Are you sure you want to delete this post? This action cannot be undone.",
                        confirmText: "Delete",
                        cancelText: "Cancel",
                        type: "danger",
                        onConfirm: () => {
                          onDelete(post.id);
                        },
                      });
                    }}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Delete post"
                >
                  <Trash size={16} />
                </motion.button>
              </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-4">
          <p className="text-gray-300 mb-4 whitespace-pre-line">{post.description}</p>

          {/* Media Content */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div
                  className={`grid gap-2 mb-4 ${
                      post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  }`}
              >
                {post.mediaUrls.map((urlString, index) => {
                  // Try to parse the media object from JSON
                  let mediaObject;
                  let isVideo = false;
                  let url = urlString;

                  // Try to parse as JSON first
                  try {
                    mediaObject = JSON.parse(urlString);
                    url = mediaObject.dataUrl;
                    isVideo = mediaObject.type === "video";
                  } catch (error) {
                    isVideo =
                        urlString.includes("video") ||
                        urlString.includes("data:video/");
                  }

                  return (
                      <div
                          key={index}
                          className="rounded-lg overflow-hidden bg-black bg-opacity-30 relative group"
                      >
                        {isVideo ? (
                            <video
                                controls
                                src={url}
                                className="w-full h-full object-contain max-h-96"
                            />
                        ) : (
                            <>
                              <img
                                  src={url}
                                  alt="Post content"
                                  className="w-full h-full object-contain max-h-96"
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            </>
                        )}
                      </div>
                  );
                })}
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center mt-3 pb-3 border-b border-gray-800">
            <div className="flex space-x-1">
              <motion.button
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLikedByUser
                          ? "text-red-500"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => onLike(post.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isLikedByUser ? "Unlike" : "Like"}
              >
                <Heart size={18} className={isLikedByUser ? "fill-red-500" : ""} />
                <span>{post.likes?.length || 0}</span>
              </motion.button>

              <motion.button
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                  onClick={() => setShowComments(!showComments)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageSquare size={18} />
                <span>{post.comments?.length || 0}</span>
              </motion.button>
            </div>

            <div className="flex space-x-1">
              <motion.button
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      saved
                          ? "text-yellow-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={saved ? "Unsave" : "Save"}
              >
                <Bookmark size={18} className={saved ? "fill-yellow-400" : ""} />
              </motion.button>

              <motion.button
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      shared
                          ? "text-yellow-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share"
              >
                <Share2 size={18} />
              </motion.button>
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
                <motion.div
                    className="mt-3 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                  {/* Add Comment Form */}
                  {currentUser && (
                      <CommentForm
                          postId={post.id}
                          onAddComment={handleAddComment}
                          currentUser={currentUser}
                      />
                  )}

                  {/* Comments List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                postId={post.id}
                                currentUser={currentUser}
                                postUserId={post.userId}
                                onCommentUpdated={handleCommentUpdated}
                                onCommentDeleted={handleCommentDeleted}
                                token={token}
                                commentType="SKILL_SHARING"
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-2">
                          No comments yet. Be the first to comment!
                        </p>
                    )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Post Modal */}
        {showEditModal && (
            <EditPostModal
                post={post}
                onClose={() => setShowEditModal(false)}
                onPostUpdated={handlePostUpdated}
                token={token}
            />
        )}
        {/* Confirmation Modal */}
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onConfirm={modalState.onConfirm}
            title={modalState.title}
            message={modalState.message}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
            confirmButtonClass={modalState.confirmButtonClass}
            type={modalState.type}
        />
      </motion.div>
  );
};

export default SkillSharingCard;