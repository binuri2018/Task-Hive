import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import {Edit, UserPlus, UserMinus, AlertCircle, BookOpen, FileText, Image, Hexagon, Target} from "lucide-react";
import {useAuth} from "../context/auth";
import ProfileLayout from "../layout/ProfileLayout";
import SkillSharingCard from "../components/SkillSharingCard";
import LearningProgressCard from "../components/LearningProgressCard";
import LearningPlanCard from "../components/LearningPlanCard";
import EditProfileModal from "../components/EditProfileModal";
import LearningGoalsModal from "../components/LearningGoalsModal";
import FollowersModal from "../components/FollowersModal";
import EditLearningProgressModal from "../components/EditLearningProgressModal";
import EditLearningPlanModal from "../components/EditLearningPlanModal";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

// API imports
import {
    getUserProfile,
    followUser,
    unfollowUser,
    getUserTotalPostCount,
} from "../api/profileAPI";
import {
    deletePost,
    addLike,
    removeLike,
    getPostsByUserId,
    addComment as addPostComment,
    updateComment as updatePostComment,
    deleteComment as deletePostComment,
} from "../api/skillSharingAPI";
import {
    deleteLearningProgress,
    addLike as addProgressLike,
    removeLike as removeProgressLike,
    getLearningProgressByUserId,
    addComment as addProgressComment,
    updateLearningProgressComment,
    deleteLearningProgressComment,
} from "../api/learningProgressAPI";
import {
    deleteLearningPlan,
    addLike as addPlanLike,
    removeLike as removePlanLike,
    getLearningPlansByUserId,
    addComment as addPlanComment,
    updateLearningPlanComment,
    deleteLearningPlanComment,
} from "../api/learningPlanAPI";

const ProfilePage = () => {
    const {userId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {modalState, openModal, closeModal} = useConfirmModal();

    const [profileUser, setProfileUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("progress");
    const [posts, setPosts] = useState([]);
    const [progressEntries, setProgressEntries] = useState([]);
    const [learningPlans, setLearningPlans] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [contentLoading, setContentLoading] = useState(true);
    const [totalPostCount, setTotalPostCount] = useState(0);
    const [editingProgress, setEditingProgress] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [showLearningGoals, setShowLearningGoals] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                // Fetch user profile data
                const profileData = await getUserProfile(userId);
                setProfileUser(profileData);

                // Check if current user is the profile owner
                setIsOwner(currentUser?.id === userId);

                // Check if current user is following this profile
                setIsFollowing(
                    currentUser?.followingUsers?.includes(userId) ||
                    profileData.followedUsers?.includes(currentUser?.id)
                );

                // Fetch total post count
                const postCountData = await getUserTotalPostCount(
                    userId,
                    currentUser?.token
                );
                setTotalPostCount(postCountData.totalPosts);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [userId, currentUser]);

    useEffect(() => {
        // Fetch content based on active tab
        const fetchContent = async () => {
            if (!profileUser) return;

            setContentLoading(true);
            try {
                let postsData;
                let progressData;
                let plansData;

                switch (activeTab) {
                    case "posts":
                        postsData = await getPostsByUserId(userId, currentUser?.token);
                        setPosts(postsData.data || []);
                        break;
                    case "progress":
                        progressData = await getLearningProgressByUserId(
                            userId,
                            currentUser?.token
                        );
                        setProgressEntries(progressData.data || []);
                        break;
                    case "plans":
                        plansData = await getLearningPlansByUserId(
                            userId,
                            currentUser?.token
                        );
                        setLearningPlans(plansData.data || []);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab}:`, error);
                toast.error(`Failed to load ${activeTab}`);
            } finally {
                setContentLoading(false);
            }
        };

        fetchContent();
    }, [activeTab, profileUser, userId, currentUser?.token]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast.error("You must be logged in to follow users");
            navigate("/login");
            return;
        }

        try {
            if (isFollowing) {
                await unfollowUser(userId, currentUser?.token);
                toast.success(`Unfollowed ${profileUser.name}`);
            } else {
                await followUser(userId, currentUser?.token);
                toast.success(`Now following ${profileUser.name}`);
            }

            // Toggle following state
            setIsFollowing(!isFollowing);

            // Update followers count in profile data
            setProfileUser((prev) => ({
                ...prev,
                followedUsers: isFollowing
                    ? (prev.followedUsers || []).filter((id) => id !== currentUser?.id)
                    : [...(prev.followedUsers || []), currentUser?.id],
            }));
        } catch (error) {
            console.error("Error following/unfollowing user:", error);
            toast.error("Failed to update follow status");
        }
    };

    const handleProfileUpdated = (updatedProfile) => {
        setProfileUser(updatedProfile);
        setShowEditProfile(false);
    };

    // Comment handlers for posts
    const handleAddPostComment = async (postId, commentData) => {
        if (!currentUser) {
            toast.error("You must be logged in to comment");
            navigate("/login");
            return false;
        }

        try {
            const response = await addPostComment(
                postId,
                commentData,
                currentUser.token
            );

            // Update posts state directly with the response data
            setPosts(
                posts.map((post) => (post.id === postId ? response.data : post))
            );

            return response;
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
            throw error;
        }
    };

    const handleUpdatePostComment = (postId, commentId, newContent) => {
        // Update the comment directly in the state
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.map((comment) => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    content: newContent,
                                    updatedAt: new Date(),
                                };
                            }
                            return comment;
                        }),
                    };
                }
                return post;
            })
        );
    };

    const handleDeletePostComment = (postId, commentId) => {
        // Remove the comment from the state
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(
                            (comment) => comment.id !== commentId
                        ),
                    };
                }
                return post;
            })
        );
    };

    // Progress comment handlers
    const handleAddProgressComment = async (progressId, commentData) => {
        if (!currentUser) {
            toast.error("You must be logged in to comment");
            navigate("/login");
            return false;
        }

        try {
            await addProgressComment(progressId, commentData, currentUser.token);

            // Refresh progress entries to get the updated comments
            const progressData = await getLearningProgressByUserId(
                userId,
                currentUser?.token
            );
            setProgressEntries(progressData.data || []);

            return true;
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
            return false;
        }
    };

    const handleUpdateProgressComment = async (
        progressId,
        commentId,
        updatedContent
    ) => {
        try {
            const updatedComment = {
                id: commentId,
                content: updatedContent,
            };
            await updateLearningProgressComment(
                progressId,
                commentId,
                updatedComment,
                currentUser.token
            );

            // Refresh progress entries to get the updated comments
            const progressData = await getLearningProgressByUserId(
                userId,
                currentUser?.token
            );
            setProgressEntries(progressData.data || []);

            return true;
        } catch (error) {
            console.error("Error updating comment:", error);
            toast.error("Failed to update comment");
            return false;
        }
    };

    const handleDeleteProgressComment = async (progressId, commentId) => {
        try {
            await deleteLearningProgressComment(
                progressId,
                commentId,
                currentUser.id,
                currentUser.token
            );

            // Refresh progress entries to get the updated comments
            const progressData = await getLearningProgressByUserId(
                userId,
                currentUser?.token
            );
            setProgressEntries(progressData.data || []);

            return true;
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
            return false;
        }
    };

    // Plan comment handlers
    const handleAddPlanComment = async (planId, commentData) => {
        if (!currentUser) {
            toast.error("You must be logged in to comment");
            navigate("/login");
            return false;
        }

        try {
            await addPlanComment(planId, commentData, currentUser.token);

            // Refresh plans to get the updated comments
            const plansData = await getLearningPlansByUserId(
                userId,
                currentUser?.token
            );
            setLearningPlans(plansData.data || []);

            return true;
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
            return false;
        }
    };

    const handleUpdatePlanComment = async (planId, commentId, updatedContent) => {
        try {
            const updatedComment = {
                id: commentId,
                content: updatedContent,
            };
            await updateLearningPlanComment(
                planId,
                commentId,
                updatedComment,
                currentUser.token
            );

            // Refresh plans to get the updated comments
            const plansData = await getLearningPlansByUserId(
                userId,
                currentUser?.token
            );
            setLearningPlans(plansData.data || []);

            return true;
        } catch (error) {
            console.error("Error updating comment:", error);
            toast.error("Failed to update comment");
            return false;
        }
    };

    const handleDeletePlanComment = async (planId, commentId) => {
        try {
            await deleteLearningPlanComment(
                planId,
                commentId,
                currentUser.id,
                currentUser.token
            );

            // Refresh plans to get the updated comments
            const plansData = await getLearningPlansByUserId(
                userId,
                currentUser?.token
            );
            setLearningPlans(plansData.data || []);

            return true;
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
            return false;
        }
    };

    const handleDeletePost = async (postId, isUpdate = false) => {
        if (isUpdate) {
            // If this is called after a post update, refresh the posts data
            try {
                const postsData = await getPostsByUserId(userId, currentUser?.token);
                setPosts(postsData.data || []);
                return;
            } catch (error) {
                console.error("Error refreshing posts:", error);
                toast.error("Failed to refresh posts");
                return;
            }
        }

        try {
            await deletePost(postId, currentUser?.token);
            setPosts(posts.filter((post) => post.id !== postId));
            // Update total post count after successful deletion
            setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));
            toast.success("Post deleted successfully")
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleLikePost = async (postId) => {
        if (!currentUser) {
            toast.error("You must be logged in to like posts");
            navigate("/login");
            return;
        }

        const post = posts.find((p) => p.id === postId);
        const isLiked = post?.likes?.some(
            (like) => like.userId === currentUser?.id
        );

        // Create a copy of the original posts state for potential rollback
        const originalPosts = [...posts];

        // Update UI immediately
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    if (isLiked) {
                        return {
                            ...post,
                            likes: post.likes.filter(
                                (like) => like.userId !== currentUser?.id
                            ),
                        };
                    } else {
                        return {
                            ...post,
                            likes: [
                                ...post.likes,
                                {userId: currentUser?.id, createdAt: new Date()},
                            ],
                        };
                    }
                }
                return post;
            })
        );

        try {
            // Make the API call after UI is already updated
            if (isLiked) {
                await removeLike(postId, currentUser?.id, currentUser?.token);
            } else {
                const likeData = {userId: currentUser?.id};
                await addLike(postId, likeData, currentUser?.token);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to process like");

            // Revert to original state if API call fails
            setPosts(originalPosts);
        }
    };

    const handleEditProgress = (progress) => {
        setEditingProgress(progress);
    };

    const handleProgressUpdated = async () => {
        try {
            const progressData = await getLearningProgressByUserId(
                userId,
                currentUser?.token
            );
            setProgressEntries(progressData.data || []);
            setEditingProgress(null);
        } catch (error) {
            console.error("Error refreshing progress data:", error);
        }
    };

    const handleLikeProgress = async (progressId) => {
        if (!currentUser) {
            toast.error("You must be logged in to like progress updates");
            navigate("/login");
            return;
        }

        const progress = progressEntries.find((p) => p.id === progressId);
        const isLiked = progress?.likes?.some(
            (like) => like.userId === currentUser?.id
        );

        try {
            if (isLiked) {
                await removeProgressLike(
                    progressId,
                    currentUser?.id,
                    currentUser?.token
                );
            } else {
                const likeData = {userId: currentUser?.id};
                await addProgressLike(progressId, likeData, currentUser?.token);
            }

            // Update state immediately for better UX
            setProgressEntries(
                progressEntries.map((entry) => {
                    if (entry.id === progressId) {
                        if (isLiked) {
                            return {
                                ...entry,
                                likes: entry.likes.filter(
                                    (like) => like.userId !== currentUser?.id
                                ),
                            };
                        } else {
                            return {
                                ...entry,
                                likes: [
                                    ...entry.likes,
                                    {userId: currentUser?.id, createdAt: new Date()},
                                ],
                            };
                        }
                    }
                    return entry;
                })
            );

        } catch (error) {
            console.error("Error toggling progress like:", error);
            toast.error("Failed to process like");

            // Refresh progress data to ensure UI is in sync with server
            const progressData = await getLearningProgressByUserId(
                userId,
                currentUser?.token
            );
            setProgressEntries(progressData.data || []);
        }
    };

    const handleDeleteProgress = async (progressId) => {
        try {
            await deleteLearningProgress(progressId, currentUser?.token);
            setProgressEntries(
                progressEntries.filter((progress) => progress.id !== progressId)
            );
            // Update total post count after successful deletion
            setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));

        } catch (error) {
            console.error("Error deleting progress:", error);
        }
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
    };

    const handlePlanUpdated = async () => {
        // Refresh plan data after update
        try {
            const plansData = await getLearningPlansByUserId(
                userId,
                currentUser?.token
            );
            setLearningPlans(plansData.data || []);
            setEditingPlan(null);
        } catch (error) {
            console.error("Error refreshing plan data:", error);
            toast.error("Failed to refresh plan data");
        }
    };

    const handleLikePlan = async (planId) => {
        if (!currentUser) {
            toast.error("You must be logged in to like learning plans");
            navigate("/login");
            return;
        }

        const plan = learningPlans.find((p) => p.id === planId);
        const isLiked = plan?.likes?.some(
            (like) => like.userId === currentUser?.id
        );

        try {
            if (isLiked) {
                await removePlanLike(planId, currentUser?.id, currentUser?.token);
            } else {
                const likeData = {userId: currentUser?.id};
                await addPlanLike(planId, likeData, currentUser?.token);
            }

            // Update state immediately for better UX
            setLearningPlans(
                learningPlans.map((plan) => {
                    if (plan.id === planId) {
                        if (isLiked) {
                            return {
                                ...plan,
                                likes: plan.likes.filter(
                                    (like) => like.userId !== currentUser?.id
                                ),
                            };
                        } else {
                            return {
                                ...plan,
                                likes: [
                                    ...plan.likes,
                                    {userId: currentUser?.id, createdAt: new Date()},
                                ],
                            };
                        }
                    }
                    return plan;
                })
            );
        } catch (error) {
            console.error("Error toggling plan like:", error);
            toast.error("Failed to process like");

            // Refresh plans data to ensure UI is in sync with server
            const plansData = await getLearningPlansByUserId(
                userId,
                currentUser?.token
            );
            setLearningPlans(plansData.data || []);
        }
    };

    const handleDeletePlan = async (planId) => {
        try {
            await deleteLearningPlan(planId, currentUser?.token);
            setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
            // Update total post count after successful deletion
            setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));
        } catch (error) {
            console.error("Error deleting learning plan:", error);
        }
    };

    const handleShowFollowers = () => {
        setShowFollowers(true);
    };

    const handleShowFollowing = () => {
        setShowFollowing(true);
    };

    const handleShowLearningGoals = () => {
        setShowLearningGoals(true);
    };

    if (!profileUser && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div
                    className="max-w-md w-full bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative w-16 h-16">
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 80 80"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M40 12L69.3 28V60L40 76L10.7 60V28L40 12Z"
                                    fill="#F5D13B"
                                    fillOpacity="0.2"
                                    stroke="#F5D13B"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-red-500">
                                <AlertCircle size={28}/>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        User Not Found
                    </h2>
                    <p className="text-gray-400 mb-6">
                        The user profile you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    const actionButtons = isOwner ? (
        <div className="flex flex-wrap gap-2">
            <button
                    onClick={() => setShowEditProfile(true)}
                className="flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
                <Edit size={14} className="mr-1.5"/>
                Edit Profile
            </button>
            <button
                onClick={handleShowLearningGoals}
                className="flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors"
                >
                <Target size={14} className="mr-1.5"/>
                Learning Goals
            </button>
        </div>
            ) : (
        <div className="flex gap-2">
            <button
                    onClick={handleFollowToggle}
                className={`flex items-center px-3 py-1.5 rounded-lg transition-colors ${
                        isFollowing
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-yellow-500 hover:bg-yellow-400 text-black"
                }`}
                >
                    {isFollowing ? (
                        <>
                        <UserMinus size={14} className="mr-1.5"/>
                            Unfollow
                        </>
                    ) : (
                        <>
                        <UserPlus size={14} className="mr-1.5"/>
                            Follow
                        </>
                    )}
            </button>
        </div>
    );

    return (
        <ProfileLayout
            profileUser={profileUser}
            isLoading={isLoading}
            actionButtons={actionButtons}
            totalPostCount={totalPostCount}
            onShowFollowers={handleShowFollowers}
            onShowFollowing={handleShowFollowing}
        >
            {/* Content Tabs */}
            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden mb-6">
                <div className="grid grid-cols-3 gap-px bg-gray-800">
                    {[
                        {id: "posts", label: "Skill Sharing", icon: <Image size={18}/>},
                        {id: "progress", label: "Progress", icon: <BookOpen size={18}/>},
                        {id: "plans", label: "Plans", icon: <FileText size={18}/>}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative py-4 text-center transition-colors cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-gray-900 text-yellow-400 font-medium"
                                    : "bg-gray-900 text-gray-400 hover:text-white"
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="mb-1">{tab.icon}</span>
                                <span className="text-sm">{tab.label}</span>
                            </div>

                            {activeTab === tab.id && (
                                <motion.div
                                    className="absolute bottom-0 inset-x-0 h-0.5 bg-yellow-400"
                                    layoutId="activeProfileTab"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{duration: 0.3}}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {contentLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <motion.div
                            className="relative w-10 h-10"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3}}
                        >
                            <div className="absolute inset-0">
                                <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"
                                     className="w-full h-full animate-spin">
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
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-3 w-3 bg-yellow-500 opacity-70 rounded-sm rotate-45"></div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="wait">
                            {activeTab === "posts" &&
                                (posts.length > 0 ? (
                                    <motion.div
                                        key="posts"
                                        className="space-y-6"
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -20}}
                                        transition={{duration: 0.3}}
                                    >
                                        {posts.map((post) => (
                                            <SkillSharingCard
                                                key={post.id}
                                                post={post}
                                                currentUser={currentUser}
                                                onLike={handleLikePost}
                                                onDelete={handleDeletePost}
                                                onComment={handleAddPostComment}
                                                onCommentUpdated={handleUpdatePostComment}
                                                onCommentDeleted={handleDeletePostComment}
                                                token={currentUser?.token}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <EmptyState
                                        icon={<Image/>}
                                        title="No skill sharing posts yet"
                                        message={isOwner
                                            ? "Share your skills with the community!"
                                            : `${profileUser.name} hasn't shared any posts yet.`}
                                    />
                                ))}

                            {activeTab === "progress" &&
                                (progressEntries.length > 0 ? (
                                    <motion.div
                                        key="progress"
                                        className="space-y-6"
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -20}}
                                        transition={{duration: 0.3}}
                                    >
                                        {progressEntries.map((progress) => (
                                            <LearningProgressCard
                                                key={progress.id}
                                                progress={progress}
                                                currentUser={currentUser}
                                                onLike={handleLikeProgress}
                                                onDelete={handleDeleteProgress}
                                                onEdit={handleEditProgress}
                                                onComment={handleAddProgressComment}
                                                onUpdateComment={handleUpdateProgressComment}
                                                onDeleteComment={handleDeleteProgressComment}
                                                token={currentUser?.token}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <EmptyState
                                        icon={<BookOpen/>}
                                        title="No progress updates yet"
                                        message={isOwner
                                            ? "Start sharing your learning journey!"
                                            : `${profileUser.name} hasn't shared any progress updates yet.`}
                                    />
                                ))}

                            {activeTab === "plans" &&
                                (learningPlans.length > 0 ? (
                                    <motion.div
                                        key="plans"
                                        className="space-y-6"
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -20}}
                                        transition={{duration: 0.3}}
                                    >
                                        {learningPlans.map((plan) => (
                                            <LearningPlanCard
                                                key={plan.id}
                                                plan={plan}
                                                currentUser={currentUser}
                                                onLike={handleLikePlan}
                                                onDelete={handleDeletePlan}
                                                onEdit={handleEditPlan}
                                                onComment={handleAddPlanComment}
                                                onUpdateComment={handleUpdatePlanComment}
                                                onDeleteComment={handleDeletePlanComment}
                                                token={currentUser?.token}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <EmptyState
                                        icon={<FileText/>}
                                        title="No learning plans yet"
                                        message={isOwner
                                            ? "Create and share learning plans with the community!"
                                            : `${profileUser.name} hasn't shared any learning plans yet.`}
                                    />
                                ))}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
            {showEditProfile && (
                <EditProfileModal
                    user={profileUser}
                    onClose={() => setShowEditProfile(false)}
                    onProfileUpdated={handleProfileUpdated}
                    token={currentUser?.token}
                />
            )}

                {showLearningGoals && (
                    <LearningGoalsModal
                        user={profileUser}
                        onClose={() => setShowLearningGoals(false)}
                        onProfileUpdated={handleProfileUpdated}
                        token={currentUser?.token}
                    />
                )}

            {showFollowers && (
                <FollowersModal
                    isOpen={showFollowers}
                    onClose={() => setShowFollowers(false)}
                    title="Followers"
                    users={profileUser.followedUsers || []}
                    currentUser={currentUser}
                    token={currentUser?.token}
                />
            )}

            {showFollowing && (
                <FollowersModal
                    isOpen={showFollowing}
                    onClose={() => setShowFollowing(false)}
                    title="Following"
                    users={profileUser.followingUsers || []}
                    currentUser={currentUser}
                    token={currentUser?.token}
                />
            )}

            {/* Edit Progress Modal */}
            {editingProgress && (
                <EditLearningProgressModal
                    progressEntry={editingProgress}
                    onClose={() => setEditingProgress(null)}
                    onProgressUpdated={handleProgressUpdated}
                    token={currentUser?.token}
                />
            )}

            {/* Edit Plan Modal */}
            {editingPlan && (
                <EditLearningPlanModal
                    plan={editingPlan}
                    onClose={() => setEditingPlan(null)}
                    onPlanUpdated={handlePlanUpdated}
                    token={currentUser?.token}
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
            </AnimatePresence>
        </ProfileLayout>
    );
};

// Empty state component for when there's no content to display
const EmptyState = ({icon, title, message}) => (
    <motion.div
        className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-8 text-center"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
    >
        <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400">
                {React.cloneElement(icon, {size: 28})}
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        <div className="w-16 h-1 bg-yellow-500 opacity-50 mx-auto rounded-full"></div>
    </motion.div>
);

export default ProfilePage;