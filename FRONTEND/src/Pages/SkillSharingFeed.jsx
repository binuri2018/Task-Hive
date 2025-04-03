import {useState, useEffect} from "react";
import {Heart, MessageSquare, Edit, Trash, Filter, TrendingUp, Clock, Sparkles} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useAuth} from "../context/auth";
import toast from "react-hot-toast";
import {
    getAllPosts,
    addLike,
    removeLike,
    addComment,
    deletePost,
} from "../api/skillSharingAPI";
import useConfirmModal from "../hooks/useConfirmModal";
import CreatePostForm from "../components/CreateSkillPostModal";
import Comment, {CommentForm} from "../components/CommentComponent";
import EditPostModal from "../components/EditSkillPostModal";
import ConfirmModal from "../components/ConfirmModal";
import SkillSharingCard from "../components/SkillSharingCard";
import {Link} from "react-router-dom";

const SkillSharingFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState({});
    const [editingPost, setEditingPost] = useState(null);
    const [filterOption, setFilterOption] = useState("latest");
    const {modalState, openModal, closeModal} = useConfirmModal();

    const {currentUser} = useAuth();

    useEffect(() => {
        // fetch all posts when component mounts
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await getAllPosts(currentUser?.token);
            setPosts(response.data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = () => {
        fetchPosts();
    };

    const handlePostUpdated = () => {
        fetchPosts();
        setEditingPost(null);
    };

    const handleDeletePost = async (postId, isUpdate = false) => {
        if (isUpdate) {
            // This is just a post update, refresh the feed
            fetchPosts();
            return;
        }

        try {
            await deletePost(postId, currentUser?.token);
            setPosts(posts.filter((post) => post.id !== postId));
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        }

    };

    const handleLike = async (postId) => {
        const post = posts.find((p) => p.id === postId);
        const isLiked = post?.likes?.some(
            (like) => like.userId === currentUser?.id
        );

        const originalPosts = [...posts];

        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    if (isLiked) {
                        return {
                            ...post,
                            likes: post.likes.filter(
                                (like) => like.userId !== currentUser.id
                            ),
                        };
                    } else {
                        return {
                            ...post,
                            likes: [
                                ...(post.likes || []),
                                {userId: currentUser.id, createdAt: new Date()},
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
                await removeLike(postId, currentUser.id, currentUser.token);
            } else {
                const likeData = {userId: currentUser.id};
                await addLike(postId, likeData, currentUser.token);
            }
            // If successful, we keep the UI as is (already updated)
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to process like");

            // Revert to original state if API call fails
            setPosts(originalPosts);
        }
    };

    const toggleComments = (postId) => {
        setShowComments({
            ...showComments,
            [postId]: !showComments[postId],
        });
    };

    const handleAddComment = async (postId, commentData) => {
        try {
            const response = await addComment(postId, commentData, currentUser.token);

            // Update the posts state with the updated post from the response
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

    const handleCommentUpdated = (postId, commentId, newContent) => {
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

    const handleCommentDeleted = (postId, commentId) => {
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

    // Filter and sort posts based on selected option
    const getFilteredPosts = () => {
        if (!posts.length) return [];

        let filteredPosts = [...posts];

        switch (filterOption) {
            case 'trending':
                // Sort by most likes
                filteredPosts.sort((a, b) =>
                    (b.likes?.length || 0) - (a.likes?.length || 0)
                );
                break;
            case 'popular':
                // Sort by most comments
                filteredPosts.sort((a, b) =>
                    (b.comments?.length || 0) - (a.comments?.length || 0)
                );
                break;
            case 'latest':
            default:
                // Sort by most recent
                filteredPosts.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
        }

        return filteredPosts;
    };

    useEffect(() => {
        const filteredPosts = getFilteredPosts();
        setPosts(filteredPosts);
    }, [filterOption]);

    return (
        <div className="space-y-6">
            {/* Create Post Component */}
            <motion.div
                className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
            >
                <div className="p-4">
                    <CreatePostForm onPostCreated={handlePostCreated}/>
                </div>
            </motion.div>

            {/* Filter Controls */}
            <motion.div
                className="bg-gray-900 rounded-xl p-2 flex justify-between items-center shadow-lg border border-gray-800"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3, delay: 0.1}}
            >
                <div className="flex items-center space-x-1">
          <span className="text-gray-400 px-2 hidden sm:inline">
            <Filter size={16}/>
          </span>
                    <span className="text-gray-300 font-medium hidden sm:inline">Filter:</span>
                </div>

                <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                        disabled={loading}
                        onClick={() => {
                            setFilterOption('latest');
                        }}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                            filterOption === 'latest'
                                ? 'bg-black text-yellow-400'
                                : 'text-gray-400 hover:text-white'
                        } ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <Clock size={14}/>
                        <span className="hidden sm:inline">Latest</span>
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => setFilterOption('trending')}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            filterOption === 'trending'
                                ? 'bg-black text-yellow-400'
                                : 'text-gray-400 hover:text-white'
                        } ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <TrendingUp size={14}/>
                        <span className="hidden sm:inline">Trending</span>
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => setFilterOption('popular')}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                            filterOption === 'popular'
                                ? 'bg-black text-yellow-400'
                                : 'text-gray-400 hover:text-white'
                        } ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <Sparkles size={14}/>
                        <span className="hidden sm:inline">Popular</span>
                    </button>
                </div>
            </motion.div>

            {/* Posts Feed */}
            {loading ? (
                <div className="flex justify-center items-center my-12">
                    <motion.div
                        className="relative w-12 h-12"
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
                                    strokeDasharray="200"
                                    strokeDashoffset="150"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 bg-yellow-500 opacity-70 rounded-sm rotate-45"></div>
                        </div>
                    </motion.div>
                </div>
            ) : posts.length === 0 ? (
                <motion.div
                    className="bg-gray-900 rounded-xl p-8 text-center shadow-lg border border-gray-800"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                >
                    <div className="mb-4 flex justify-center">
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
                            <div className="absolute inset-0 flex items-center justify-center text-yellow-400">
                                <MessageSquare size={24}/>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        No posts yet
                    </h3>
                    <p className="text-gray-400">
                        Be the first to share your skills and learning progress!
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{opacity: 0, y: 50}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: index * 0.1}}
                            >
                                <SkillSharingCard
                                    post={post}
                                    currentUser={currentUser}
                                    onLike={handleLike}
                                    onDelete={handleDeletePost}
                                    onComment={handleAddComment}
                                    onCommentUpdated={handleCommentUpdated}
                                    onCommentDeleted={handleCommentDeleted}
                                    token={currentUser.token}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default SkillSharingFeed;