import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X, Image, Video, Upload, AlertCircle } from "lucide-react";
import { updatePost } from "../api/skillSharingAPI";
import toast from "react-hot-toast";

const EditPostModal = ({ post, onClose, onPostUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [replaceMedia, setReplaceMedia] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      description: post?.description || "",
    },
  });

  // Determine existing media type and count
  const existingMediaCount = post?.mediaUrls?.length || 0;
  const existingMediaType = post?.mediaUrls?.some(
      (url) =>
          (typeof url === "string" &&
              (url.includes("video") || url.includes("data:video/"))) ||
          (typeof url === "object" && url?.type === "video")
  )
      ? "video"
      : "image";

  const validateVideoDuration = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject("Video must be 30 seconds or less");
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

      // Clear previous preview URLs
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      // Create preview URLs for selected files (for UI only)
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);

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

      // Store the processed media items
      const base64Urls = mediaItems.map((item) => {
        return JSON.stringify({
          dataUrl: item.dataUrl,
          type: item.type,
          fileType: item.fileType,
        });
      });

      setNewMedia(base64Urls);
      setMediaType(newMediaType);
      setReplaceMedia(true);

      toast.success(`${files.length} new files ready to upload`);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setIsProcessingFiles(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Only replace media if new files were uploaded
      const updatedPostData = {
        description: data.description,
        mediaUrls: replaceMedia ? newMedia : post.mediaUrls,
      };

      await updatePost(post.id, updatedPostData, token);
      toast.success("Post updated successfully");
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
        <motion.div
            className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">Edit Post</h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <div className="mb-4">
            <textarea
                className={`w-full p-3 rounded-lg border ${
                    errors.description ? "border-red-500" : "border-gray-700"
                } bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none`}
                placeholder="Share your skills or what you're learning..."
                rows="4"
                {...register("description", {
                  required: "Description is required",
                })}
                disabled={isSubmitting || isProcessingFiles}
            />
              {errors.description && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.description.message}
                  </p>
              )}
            </div>

            {/* Media Section */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-3 flex items-center">
                <Upload size={16} className="mr-2 text-yellow-400" />
                Media
              </h4>

              {/* Existing media info */}
              {existingMediaCount > 0 && !replaceMedia ? (
                  <div className="mb-3 p-3 bg-gray-900 rounded-lg border border-gray-700 flex items-center">
                    {existingMediaType === "video" ? (
                        <Video className="text-yellow-400 mr-2" size={20} />
                    ) : (
                        <Image className="text-yellow-400 mr-2" size={20} />
                    )}
                    <div>
                      <p className="text-sm text-white">
                        Currently has {existingMediaCount} {existingMediaType}
                        {existingMediaCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload new files below to replace existing media
                      </p>
                    </div>
                  </div>
              ) : null}

              {/* New media status */}
              {replaceMedia && (
                  <div className="mb-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-sm text-white flex items-center">
                      {mediaType === "video" ? (
                          <Video className="text-yellow-400 mr-2" size={18} />
                      ) : (
                          <Image className="text-yellow-400 mr-2" size={18} />
                      )}
                      {newMedia.length} new {mediaType}
                      {newMedia.length > 1 ? "s" : ""} ready to upload
                    </p>
                    {/* Preview of new media */}
                    <div className={`grid gap-2 mt-3 ${previewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {previewUrls.map((url, index) => (
                          <div key={index} className="bg-black rounded-lg overflow-hidden h-20">
                            {mediaType === "video" ? (
                                <video src={url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                          </div>
                      ))}
                    </div>
                    <button
                        type="button"
                        className="text-xs text-red-400 hover:text-red-300 mt-2 cursor-pointer flex items-center"
                        onClick={() => {
                          setNewMedia([]);
                          setReplaceMedia(false);

                          // Clear preview URLs
                          previewUrls.forEach(url => {
                            if (url.startsWith("blob:")) {
                              URL.revokeObjectURL(url);
                            }
                          });
                          setPreviewUrls([]);
                        }}
                    >
                      <X size={12} className="mr-1" />
                      Cancel and keep existing media
                    </button>
                  </div>
              )}

              {/* File upload */}
              {isProcessingFiles ? (
                  <div className="flex justify-center items-center h-20 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex flex-col items-center">
                      <div className="relative w-8 h-8">
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
                  <label
                      className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg transition-all duration-200 ${
                          isSubmitting || isProcessingFiles
                              ? "border-gray-700 bg-gray-900 cursor-not-allowed"
                              : "border-yellow-700 bg-gray-900 cursor-pointer hover:border-yellow-500 hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-yellow-400" />
                      <p className="mb-1 text-sm text-yellow-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        Images (JPG, PNG, GIF) or Videos (MP4, WebM) up to 30 seconds
                      </p>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isSubmitting || isProcessingFiles}
                    />
                  </label>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-900 disabled:text-gray-600 cursor-pointer"
                  whileHover={{ scale: isSubmitting || isProcessingFiles ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting || isProcessingFiles ? 1 : 0.97 }}
                  disabled={isSubmitting || isProcessingFiles}
              >
                Cancel
              </motion.button>

              <motion.button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-yellow-900 disabled:text-gray-400  cursor-pointer"
                  whileHover={{ scale: isSubmitting || isProcessingFiles ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting || isProcessingFiles ? 1 : 0.97 }}
                  disabled={isSubmitting || isProcessingFiles}
              >
                {isSubmitting
                    ? "Updating..."
                    : isProcessingFiles
                        ? "Processing..."
                        : "Update Post"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default EditPostModal;