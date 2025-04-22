import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Target, Calendar, Trash, Edit2, CheckSquare, Square, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateAllLearningGoals, toggleLearningGoalCompletion, updateLearningGoalProgress } from "../api/learningGoalsAPI";

const LearningGoalsModal = ({ user, onClose, onProfileUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState(user?.learningGoals || []);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      setGoals(user.learningGoals || []);
    }
  }, [user]);

  // Format date to MMM d, yyyy (e.g., "Jan 1, 2023")
  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Format date to yyyy-MM-dd for input[type="date"]
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddGoal = (data) => {
    const newGoal = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      targetDate: new Date(data.targetDate),
      category: data.category,
      progressPercentage: 0,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    reset();
    setShowAddForm(false);
    updateUserProfile(updatedGoals);
  };

  const handleEditGoal = (data) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === editingGoalId) {
        return {
          ...goal,
          title: data.title,
          description: data.description,
          targetDate: new Date(data.targetDate),
          category: data.category,
          updatedAt: new Date(),
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    setEditingGoalId(null);
    reset();
    updateUserProfile(updatedGoals);
  };

  const handleRemoveGoal = (goalId) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId);
    setGoals(updatedGoals);
    updateUserProfile(updatedGoals);
  };

  const handleToggleComplete = async (goalId) => {
    try {
      // Determine the current completion status
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      const newCompletionStatus = !goal.completed;
      
      // Update UI optimistically
      const updatedGoals = goals.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            completed: newCompletionStatus,
            progressPercentage: newCompletionStatus ? 100 : goal.progressPercentage,
            updatedAt: new Date(),
          };
        }
        return goal;
      });
      
      setGoals(updatedGoals);
      
      // Make API call to update completion status
      await toggleLearningGoalCompletion(user.id, goalId, newCompletionStatus, token);
      
      // Update the entire profile with new goals data
      onProfileUpdated({
        ...user,
        learningGoals: updatedGoals,
      });
    } catch (error) {
      console.error("Error toggling goal completion:", error);
      toast.error("Failed to update goal status");
      
      // Revert to original state if there's an error
      setGoals([...user.learningGoals]);
    }
  };

  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      // Update UI optimistically
      const updatedGoals = goals.map((goal) => {
        if (goal.id === goalId) {
          const isCompleted = newProgress === 100;
          return {
            ...goal,
            progressPercentage: newProgress,
            completed: isCompleted,
            updatedAt: new Date(),
          };
        }
        return goal;
      });
      
      setGoals(updatedGoals);
      
      // Make API call to update progress
      await updateLearningGoalProgress(
        user.id, 
        goalId, 
        { progressPercentage: newProgress }, 
        token
      );
      
      // Update the entire profile with new goals data
      onProfileUpdated({
        ...user,
        learningGoals: updatedGoals,
      });
    } catch (error) {
      console.error("Error updating goal progress:", error);
      toast.error("Failed to update progress");
      
      // Revert to original state if there's an error
      setGoals([...user.learningGoals]);
    }
  };

  const updateUserProfile = async (updatedGoals) => {
    setIsSubmitting(true);

    try {
      // Make API call to update all learning goals
      await updateAllLearningGoals(user.id, updatedGoals, token);

      toast.success("Learning goals updated successfully");
      onProfileUpdated({
        ...user,
        learningGoals: updatedGoals,
      });
    } catch (error) {
      console.error("Error updating learning goals:", error);
      toast.error("Failed to update learning goals");
      
      // Revert to original state if there's an error
      setGoals([...user.learningGoals]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (goal) => {
    setEditingGoalId(goal.id);
    reset({
      title: goal.title,
      description: goal.description,
      targetDate: formatDateForInput(goal.targetDate),
      category: goal.category,
    });
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    reset();
  };

  const categories = ["Programming", "Design", "Data Science", "Language", "Soft Skills", "Other"];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <motion.div
        className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden border border-gray-800"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Target size={18} className="text-yellow-400 mr-2" />
            Personalized Learning Goals
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="space-y-3 mb-6">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border ${
                    goal.completed
                      ? "border-green-700 bg-green-900/20"
                      : "border-gray-700 bg-gray-800/50"
                  }`}
                >
                  {editingGoalId === goal.id ? (
                    <form onSubmit={handleSubmit(handleEditGoal)}>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title*</label>
                          <input
                            type="text"
                            {...register("title", { required: "Title is required" })}
                            className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                          />
                          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea
                            {...register("description")}
                            rows="2"
                            className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Target Date*</label>
                            <input
                              type="date"
                              {...register("targetDate", { required: "Date is required" })}
                              className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            />
                            {errors.targetDate && (
                              <p className="mt-1 text-sm text-red-500">{errors.targetDate.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Category*</label>
                            <select
                              {...register("category", { required: "Category is required" })}
                              className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            >
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                            disabled={isSubmitting}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="flex items-center mb-1">
                            <button
                              onClick={() => handleToggleComplete(goal.id)}
                              className="text-gray-400 hover:text-yellow-400 mr-2"
                            >
                              {goal.completed ? (
                                <CheckSquare size={18} className="text-green-400" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                            <h4
                              className={`font-semibold ${
                                goal.completed ? "text-green-400 line-through" : "text-white"
                              }`}
                            >
                              {goal.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{goal.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-700 text-gray-300">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(goal.targetDate)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-900/30 text-yellow-400">
                              <Flag size={12} className="mr-1" />
                              {goal.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditing(goal)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveGoal(goal.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{goal.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              goal.completed ? "bg-green-500" : "bg-yellow-500"
                            }`}
                            style={{ width: `${goal.progressPercentage}%` }}
                          ></div>
                        </div>
                        {!goal.completed && (
                          <div className="flex justify-between mt-2">
                            {[0, 25, 50, 75, 100].map((progress) => (
                              <button
                                key={progress}
                                onClick={() => handleUpdateProgress(goal.id, progress)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                  goal.progressPercentage === progress
                                    ? "bg-yellow-500 text-black"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {progress}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-yellow-400 mb-4">
                <Target size={32} />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No Learning Goals Yet</h4>
              <p className="text-gray-400 mb-4">
                Set personal learning goals to track your progress and stay motivated.
              </p>
            </div>
          )}

          {/* Add New Goal Form */}
          {showAddForm ? (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
              <h4 className="font-medium text-white mb-3">Add New Learning Goal</h4>
              <form onSubmit={handleSubmit(handleAddGoal)}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title*</label>
                    <input
                      type="text"
                      placeholder="e.g., Learn React Hooks"
                      {...register("title", { required: "Title is required" })}
                      className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      placeholder="What do you want to achieve?"
                      {...register("description")}
                      rows="2"
                      className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Target Date*</label>
                      <input
                        type="date"
                        {...register("targetDate", { required: "Date is required" })}
                        className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      />
                      {errors.targetDate && <p className="mt-1 text-sm text-red-500">{errors.targetDate.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Category*</label>
                      <select
                        {...register("category", { required: "Category is required" })}
                        className="w-full p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        reset();
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                      disabled={isSubmitting}
                    >
                      Add Goal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-3 border border-dashed border-gray-700 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add New Learning Goal
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LearningGoalsModal; 