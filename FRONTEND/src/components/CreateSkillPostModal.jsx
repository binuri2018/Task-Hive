import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { createPost } from "../api/skillSharingAPI";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import { Image, Video, X, Upload, Paperclip } from "lucide-react";
import UserAvatar from "./UserAvatar";

const CreatePostForm = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video' or null
  const [base64Files, setBase64Files] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      description: "",
      mediaFiles: [],
    },
  });

  const validateVideoDuration = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject("Video duration must be 30 seconds or less");
        } else {
          resolve();
        }
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file count
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 files");
      e.target.value = "";
      return;
    }

    // Determine media type of selected files
    const hasImages = files.some((file) => file.type.startsWith("image/"));
    const hasVideos = files.some((file) => file.type.startsWith("video/"));

    // Validate mixed media types
    if (hasImages && hasVideos) {
      toast.error("You can only upload either images or videos, not both");
      e.target.value = "";
      return;
    }

    const newMediaType = hasVideos ? "video" : "image";

    // Validate media type consistency with existing files
    if (mediaType && mediaType !== newMediaType) {
      toast.error(
          `You already have ${mediaType}s. You can't mix images and videos.`
      );
      e.target.value = "";
      return;
    }

    setMediaType(newMediaType);
    setIsProcessingFiles(true);

    try {
      // For videos, validate duration
      if (hasVideos) {
        try {
          await Promise.all(files.map(validateVideoDuration));
        } catch (error) {
          toast.error(error);
          e.target.value = "";
          setIsProcessingFiles(false);
          return;
        }
      }

      // Convert files to base64
      const base64Promises = files.map(
          (file) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  // Add metadata to identify file type
                  resolve({
                    dataUrl: reader.result,
                    type: file.type.startsWith("video/") ? "video" : "image",
                    fileType: file.type,
                  });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
      );

      // Wait for all files to be converted
      const mediaItems = await Promise.all(base64Promises);

      // Clear previous preview URLs
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      // Create preview URLs for selected files (for UI only)
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);

      // Store the actual base64 data with type information for the server
      const base64Urls = mediaItems.map((item) => {
        return JSON.stringify({
          dataUrl: item.dataUrl,
          type: item.type,
          fileType: item.fileType,
        });
      });

      setBase64Files(base64Urls);
      setValue("mediaFiles", files);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setIsProcessingFiles(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!data.description.trim() && base64Files.length === 0) {
      toast.error("Please add a description or at least one file");
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        userId: currentUser.id,
        userName: currentUser.name,
        description: data.description,
        mediaUrls: base64Files, // Send base64 encoded files instead of blob URLs
      };

      await createPost(currentUser.id, postData, currentUser.token);

      toast.success("Post created successfully");
      reset();
      setPreviewUrls([]);
      setBase64Files([]);
      setMediaType(null);
      setShowForm(false);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (index) => {
    // Remove file at index
    const newPreviewUrls = [...previewUrls];
    const newBase64Files = [...base64Files];

    // Revoke URL object
    if (previewUrls[index].startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    newPreviewUrls.splice(index, 1);
    newBase64Files.splice(index, 1);

    setPreviewUrls(newPreviewUrls);
    setBase64Files(newBase64Files);
    setValue(
        "mediaFiles",
        [...document.querySelector('input[type="file"]').files].filter(
            (_, i) => i !== index
        )
    );

    if (newPreviewUrls.length === 0) {
      setMediaType(null);
    }
  };

  if (!showForm) {
    return (
        <div
            className="flex items-center space-x-3 p-1 cursor-pointer"
            onClick={() => setShowForm(true)}
        >
          <UserAvatar
              src={currentUser?.profileImage}
              alt={currentUser?.name}
              name={currentUser?.name}
              size="h-10 w-10"
          />
          <div className="bg-gray-800 rounded-full px-4 py-2.5 flex-1 text-gray-400 hover:bg-gray-700 transition-colors">
            Share your skills or what you're learning...
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start space-x-3">
            <UserAvatar
                src={currentUser?.profileImage}
                alt={currentUser?.name}
                name={currentUser?.name}
                size="h-10 w-10"
            />

            <div className="flex-1">
            <textarea
                placeholder="Share your skills or what you're learning..."
                className={`w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 ${
                    errors.description ? "border border-red-500" : "border-0"
                } focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none`}
                rows="3"
                {...register("description")}
                disabled={isSubmitting || isProcessingFiles}
            />

              {errors.description && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.description.message}
                  </p>
              )}
            </div>
          </div>

          {/* Media Preview Section */}
          {isProcessingFiles ? (
              <div className="flex justify-center items-center h-32 my-3 bg-gray-800 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10">
                    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin">
                      <path
                          d="M40 8L73.3 26V62L40 80L6.7 62V26L40 8Z"
                          fill="none"
                          stroke="#F5D13B"
                          strokeWidth="4"
                          strokeDasharray="180"
                          strokeDashoffset="120"
                          strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Processing files...</p>
                </div>
              </div>
          ) : (
              previewUrls.length > 0 && (
                  <div
                      className={`grid gap-3 my-3 ${
                          previewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                      }`}
                  >
                    {previewUrls.map((url, index) => (
                        <div
                            key={index}
                            className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700 group"
                        >
                          {mediaType === "video" ? (
                              <video
                                  src={url}
                                  className="w-full h-40 object-cover"
                                  controls
                              />
                          ) : (
                              <img
                                  src={url}
                                  alt="Preview"
                                  className="w-full h-40 object-cover"
                              />
                          )}
                          <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white hover:bg-red-900/80 hover:text-red-300 transition-colors"
                              disabled={isSubmitting || isProcessingFiles}
                          >
                            <X size={16} />
                          </button>
                        </div>
                    ))}
                  </div>
              )
          )}

          <div className="flex items-center justify-between mt-3 border-t border-gray-800 pt-3">
            <div className="flex space-x-1">
              <label
                  className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                      isSubmitting || isProcessingFiles
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-yellow-400"
                  }`}
              >
                <Image size={18} />
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting || isProcessingFiles}
                />
              </label>

              <label
                  className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                      isSubmitting || isProcessingFiles
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-yellow-400"
                  }`}
              >
                <Video size={18} />
                <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting || isProcessingFiles}
                />
              </label>

              <label
                  className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                      isSubmitting || isProcessingFiles
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-yellow-400"
                  }`}
              >
                <Paperclip size={18} />
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting || isProcessingFiles}
                />
              </label>
            </div>

            <div className="flex space-x-2">
              <motion.button
                  type="button"
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setShowForm(false);
                    reset();
                    setPreviewUrls([]);
                    setBase64Files([]);
                    setMediaType(null);
                  }}
                  disabled={isSubmitting || isProcessingFiles}
              >
                Cancel
              </motion.button>

              <motion.button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-yellow-900 disabled:text-gray-400 cursor-pointer"
                  whileHover={{ scale: isSubmitting || isProcessingFiles ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting || isProcessingFiles ? 1 : 0.97 }}
                  disabled={isSubmitting || isProcessingFiles}
              >
                {isSubmitting
                    ? "Posting..."
                    : isProcessingFiles
                        ? "Processing..."
                        : "Post"}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
  );
};

export default CreatePostForm;