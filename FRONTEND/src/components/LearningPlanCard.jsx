import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash, Heart, MessageSquare, Book, Link as LinkIcon, Share2, Bookmark } from "lucide-react";
import Comment, { CommentForm } from "./CommentComponent";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./UserAvatar";
import { Link as NavigateLink } from "react-router-dom";
import toast from "react-hot-toast";

const LearningPlanCard = ({
                            plan,
                            currentUser,
                            onLike,
                            onComment,
                            onDeleteComment,
                            onUpdateComment,
                            onEdit,
                            onDelete,
                            token,
                          }) => {
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(false);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const isLikedByUser = plan.likes?.some(
      (like) => like.userId === currentUser?.id
  );
  const isOwner = plan.userId === currentUser?.id;

  const handleDeleteClick = () => {
      onDelete(plan.id);
  };

  const handleAddComment = async (planId, commentData) => {
    try {
      await onComment(planId, commentData);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? "Learning plan removed from saved items" : "Learning plan saved successfully");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this learning plan: ${window.location.origin}/plan/${plan.id}`);
    toast.success("Link copied to clipboard");
  };

  // Format topics as tags
  const topicTags =
      plan.topics
          ?.split(",")
          .map((topic) => topic.trim())
          .filter(Boolean) || [];

  // Format resources as links
  const resourceList =
      plan.resources
          ?.split(",")
          .map((resource) => resource.trim())
          .filter(Boolean) || [];

  return (
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        {/* Plan Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <UserAvatar
                src={plan.userProfileImage}
                alt={plan.userName}
                name={plan.userName}
                size="h-10 w-10"
            />
            <div>
              <NavigateLink to={`/profile/${plan.userId}`}>
                <h3 className="font-medium text-white hover:text-yellow-400 transition-colors">
                  {plan.userName}
                </h3>
              </NavigateLink>
              <p className="text-xs text-gray-400">
                {new Date(plan.createdAt).toLocaleString()}
                {plan.updatedAt &&
                    new Date(plan.updatedAt).getTime() !== new Date(plan.createdAt).getTime() &&
                    " (updated)"}
              </p>
            </div>
          </div>

          {isOwner && (
              <div className="flex space-x-1">
                <motion.button
                    onClick={() => onEdit(plan)}
                    className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Edit plan"
                >
                  <Edit size={16} />
                </motion.button>
                <motion.button
                    onClick={handleDeleteClick}
                    className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Delete plan"
                >
                  <Trash size={16} />
                </motion.button>
              </div>
          )}
        </div>

        {/* Plan Content */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-white mb-2">{plan.title}</h3>

          {plan.description && (
              <p className="text-gray-300 mb-4">{plan.description}</p>
          )}

          {/* Topics Section */}
          {topicTags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Book size={16} className="text-yellow-400 mr-2" />
                  <span className="text-sm font-medium text-yellow-400">Topics</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topicTags.map((topic, index) => (
                      <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-700/30"
                      >
                  {topic}
                </span>
                  ))}
                </div>
              </div>
          )}

          {/* Resources Section */}
          {resourceList.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <LinkIcon size={16} className="text-yellow-400 mr-2" />
                  <span className="text-sm font-medium text-yellow-400">
                Resources
              </span>
                </div>
                <div className="bg-gray-800/70 rounded-lg p-3 space-y-2 border border-gray-700">
                  {resourceList.map((resource, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        {resource.startsWith("http") ? (
                            <a
                                href={resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 hover:underline truncate inline-block flex-1 break-all"
                            >
                              {resource}
                            </a>
                        ) : (
                            <span className="flex-1">{resource}</span>
                        )}
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4 pb-2 border-b border-gray-800">
            <div className="flex space-x-1">
              <motion.button
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLikedByUser
                          ? "text-red-500"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => onLike(plan.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isLikedByUser ? "Unlike" : "Like"}
              >
                <Heart size={18} className={isLikedByUser ? "fill-red-500" : ""} />
                <span>{plan.likes?.length || 0}</span>
              </motion.button>

              <motion.button
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                  onClick={() => setShowComments(!showComments)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageSquare size={18} />
                <span>{plan.comments?.length || 0}</span>
              </motion.button>
            </div>

            <div className="flex space-x-1">
              <motion.button
                  className={`flex items-center px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      saved
                          ? "text-yellow-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={saved ? "Unsave" : "Save plan"}
              >
                <Bookmark size={18} className={saved ? "fill-yellow-400" : ""} />
              </motion.button>

              <motion.button
                  className="flex items-center px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share plan"
              >
                <Share2 size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className="p-4 bg-gray-800/50 border-t border-gray-800">
              {/* Add Comment Form */}
              <CommentForm
                  postId={plan.id}
                  onAddComment={handleAddComment}
                  currentUser={currentUser}
              />

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
                {plan.comments && plan.comments.length > 0 ? (
                    plan.comments.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            postId={plan.id}
                            currentUser={currentUser}
                            postUserId={plan.userId}
                            onCommentUpdated={onUpdateComment}
                            onCommentDeleted={onDeleteComment}
                            token={token}
                            commentType="LEARNING_PLANS"
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-3">
                      No comments yet. Be the first to comment!
                    </p>
                )}
              </div>
            </div>
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
      </div>
  );
};

export default LearningPlanCard;