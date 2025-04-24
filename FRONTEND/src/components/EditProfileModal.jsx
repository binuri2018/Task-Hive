import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload, Camera, Trash, Plus, User, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateUserProfile } from "../api/profileAPI";

const EditProfileModal = ({ user, onClose, onProfileUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(user?.skills || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("bio", user.bio || "");
      setSkills(user.skills || []);
      setProfileImage(user.profileImage || null);
    }
  }, [user, setValue]);

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    // Check if skill already exists
    if (skills.includes(skillInput.trim())) {
      toast.error("This skill is already added");
      return;
    }

    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const profileData = {
        ...data,
        skills,
        profileImage,
      };

      const updatedProfile = await updateUserProfile(
          user.id,
          profileData,
          token
      );

      toast.success("Profile updated successfully");
      onProfileUpdated(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
        <motion.div
            className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white flex items-center">
              <User size={18} className="text-yellow-400 mr-2" />
              Edit Profile
            </h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-800 border-2 border-yellow-500 flex items-center justify-center">
                  {profileImage ? (
                      <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                      />
                  ) : (
                      <span className="text-3xl font-bold text-yellow-500">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <label className="p-2 bg-yellow-500 rounded-full text-black cursor-pointer hover:bg-yellow-400 transition-colors">
                    <Camera size={18} />
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                  </label>

                  {profileImage && (
                      <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-500 rounded-full text-white cursor-pointer hover:bg-red-600 transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Recommended: Square image, at least 200x200 pixels
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <User size={14} className="text-yellow-400 mr-1.5" />
                Name*
              </label>
              <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className={`w-full p-2 bg-gray-800 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-700"
                  } text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none`}
                  disabled={isSubmitting}
              />
              {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <FileText size={14} className="text-yellow-400 mr-1.5" />
                Bio
              </label>
              <textarea
                  {...register("bio")}
                  rows="3"
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                  placeholder="Tell us a bit about yourself"
                  disabled={isSubmitting}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Skills
              </label>
              <div className="flex">
                <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-grow p-2 bg-gray-800 rounded-l-lg border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    placeholder="Add a skill (e.g., JavaScript, Design)"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                />
                <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-r-lg hover:bg-yellow-400 transition-colors disabled:bg-yellow-900 disabled:text-gray-700 flex items-center cursor-pointer"
                    disabled={isSubmitting || !skillInput.trim()}
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>

              {/* Skills Tags */}
              {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <motion.span
                            key={index}
                            className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-700/30 rounded-lg"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                          <span>{skill}</span>
                          <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-yellow-400 hover:text-yellow-300 ml-1 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </motion.span>
                    ))}
                  </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-800">
              <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              <motion.button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-yellow-900 disabled:text-gray-700 flex items-center cursor-pointer"
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Changes
                    </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default EditProfileModal;