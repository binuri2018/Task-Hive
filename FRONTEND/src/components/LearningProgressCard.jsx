import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash, Heart, MessageSquare, Award, BookOpen, Code } from "lucide-react";
import Comment, { CommentForm } from "./CommentComponent";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./UserAvatar";
import { Link } from "react-router-dom";

// status options for display with updated styling for TaskHive theme
const STATUS_OPTIONS = {
  not_started: {
    name: "Not Started",
    color: "bg-gray-800 text-gray-300 border border-gray-700"
  },
  in_progress: {
    name: "In Progress",
    color: "bg-yellow-500/20 text-yellow-400 border border-yellow-700/30"
  },
  completed: {
    name: "Completed",
    color: "bg-green-500/20 text-green-400 border border-green-700/30"
  },
};

// template types for display with Lucide icons
const TEMPLATE_TYPES = {
  general: { icon: <Award size={16} className="mr-1.5" />, name: "General Progress" },
  tutorial: { icon: <BookOpen size={16} className="mr-1.5" />, name: "Tutorial" },
  project: { icon: <Code size={16} className="mr-1.5" />, name: "Project" },
};

const LearningProgressCard = ({
                                progress,
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
  const { modalState, openModal, closeModal } = useConfirmModal();

  const isLikedByUser = progress.likes?.some(
      (like) => like.userId === currentUser?.id
  );

  const isOwner = progress.userId === currentUser?.id;

  const handleDeleteClick = () => {
    onDelete(progress.id);
  };

  const handleAddComment = async (progressId, commentData) => {
    try {
      await onComment(progressId, commentData);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  //get the template and status info
  const templateInfo = TEMPLATE_TYPES[progress.templateType] || {
    icon: <Award size={16} className="mr-1.5" />,
    name: "Progress",
  };

  const statusInfo = STATUS_OPTIONS[progress.status] || {
    name: "Status",
    color: "bg-gray-800 text-gray-300 border border-gray-700",
  };

  return (
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        {/* Progress Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <UserAvatar
                src={progress.userProfileImage}
                alt={progress.userName}
                name={progress.userName}
                size="h-10 w-10"
            />
            <div>
              <Link to={`/profile/${progress.userId}`}>
                <h3 className="font-medium text-white hover:text-yellow-400 transition-colors">
                  {progress.userName}
                </h3>
              </Link>
              <p className="text-xs text-gray-400">
                {new Date(progress.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-800 text-yellow-400 border border-gray-700">
            {templateInfo.icon} {templateInfo.name}
          </span>
            <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}
            >
            {statusInfo.name}
          </span>

            {isOwner && (
                <div className="flex space-x-1 ml-2">
                  <motion.button
                      onClick={() => onEdit(progress)}
                      className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                      onClick={handleDeleteClick}
                      className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                  >
                    <Trash size={16} />
                  </motion.button>
                </div>
            )}
          </div>
        </div>

        {/* Progress Content */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-white mb-2">
            {progress.title}
          </h3>

          {progress.description && (
              <p className="text-gray-300 mb-3">{progress.description}</p>
          )}

          <div className="bg-gray-800/70 rounded-lg p-4 mb-4 space-y-3 border border-gray-700">
            {progress.tutorialName && (
                <div className="flex flex-wrap">
                  <span className="text-yellow-400 font-medium w-28">Tutorial:</span>
                  <span className="text-gray-300 flex-1">{progress.tutorialName}</span>
                </div>
            )}

            {progress.projectName && (
                <div className="flex flex-wrap">
                  <span className="text-yellow-400 font-medium w-28">Project:</span>
                  <span className="text-gray-300 flex-1">{progress.projectName}</span>
                </div>
            )}

            {progress.skillsLearned && (
                <div className="flex flex-wrap">
                  <span className="text-yellow-400 font-medium w-28">Skills:</span>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {progress.skillsLearned.split(",").map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-700/30"
                        >
                    {skill.trim()}
                  </span>
                    ))}
                  </div>
                </div>
            )}

            {progress.challenges && (
                <div className="flex flex-wrap">
              <span className="text-yellow-400 font-medium w-28">
                Challenges:
              </span>
                  <span className="text-gray-300 flex-1">{progress.challenges}</span>
                </div>
            )}

            {progress.nextSteps && (
                <div className="flex flex-wrap">
              <span className="text-yellow-400 font-medium w-28">
                Next Steps:
              </span>
                  <span className="text-gray-300 flex-1">{progress.nextSteps}</span>
                </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-2 pb-2 border-b border-gray-800">
            <motion.button
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLikedByUser
                        ? "text-red-500"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => onLike(progress.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              <Heart size={18} className={isLikedByUser ? "fill-red-500" : ""} />
              <span>{progress.likes?.length || 0}</span>
            </motion.button>

            <motion.button
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                onClick={() => setShowComments(!showComments)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              <MessageSquare size={18} />
              <span>{progress.comments?.length || 0}</span>
            </motion.button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className="p-4 bg-gray-800/50 border-t border-gray-800">
              {/* Add Comment Form */}
              <CommentForm
                  postId={progress.id}
                  onAddComment={handleAddComment}
                  currentUser={currentUser}
              />

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
                {progress.comments && progress.comments.length > 0 ? (
                    progress.comments.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            postId={progress.id}
                            currentUser={currentUser}
                            postUserId={progress.userId}
                            onCommentUpdated={onUpdateComment}
                            onCommentDeleted={onDeleteComment}
                            token={token}
                            commentType="LEARNING_PROGRESS"
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

export default LearningProgressCard;