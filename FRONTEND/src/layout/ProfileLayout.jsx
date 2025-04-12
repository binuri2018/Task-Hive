import React from "react";
import {motion} from "framer-motion";
import {Calendar, MapPin, Link as LinkIcon, Mail, Users, ArrowLeft, Target} from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import {useNavigate} from "react-router-dom";

const ProfileLayout = ({
                           profileUser,
                           isLoading,
                           actionButtons,
                           totalPostCount,
                           onShowFollowers,
                           onShowFollowing,
                           children,
                       }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black pt-20 pb-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center items-center py-20">
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
                </div>
            </div>
        );
    }

    console.log(profileUser)
    const joinedDate = profileUser?.createdAt
        ? new Date(profileUser.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
        : "Unknown";

    const hasBio = profileUser?.bio && profileUser.bio.trim() !== "";
    const hasLocation = profileUser?.location && profileUser.location.trim() !== "";
    const hasWebsite = profileUser?.website && profileUser.website.trim() !== "";

    // Get active learning goals count
    const activeGoalsCount = profileUser?.learningGoals?.filter(goal => !goal.completed)?.length || 0;
    const completedGoalsCount = profileUser?.learningGoals?.filter(goal => goal.completed)?.length || 0;

    // Check if we have any profile details to show
    const hasProfileDetails = hasBio || hasLocation || hasWebsite || profileUser?.email || 
                              (profileUser?.learningGoals && profileUser.learningGoals.length > 0);

    const handleBackClick = () => {
        //go to previous page of the browser history
        navigate("/");
    }
    return (
        <div className="min-h-screen bg-black pt-20 pb-10 px-4">
            <div className="max-w-4xl mx-auto space-y-3">
                {/* Back Button */}
                <motion.button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors mb-4 cursor-pointer"
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span>Back</span>
                </motion.button>
                {/* Profile Header Card */}
                <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                    {/* Cover Photo - Hexagon Pattern */}
                    <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                        {/* Honeycomb Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23F5D13B' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}></div>

                        {/* Accent Color Overlay */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="p-6 relative">
                        {/* Avatar - Positioned to overlap the cover photo */}
                        <div className="absolute -top-20 left-6 border-4 border-gray-900 rounded-full">
                            <UserAvatar
                                src={profileUser?.profileImage}
                                alt={profileUser?.name}
                                name={profileUser?.name}
                                size="h-32 w-32"
                            />
                        </div>

                        {/* Actions - Positioned at the top right */}
                        <div className="absolute top-4 right-6 flex space-x-2">
                            {actionButtons}
                        </div>

                        {/* Profile Info - Positioned with spacing to accommodate the avatar */}
                        <div className="mt-14 sm:mt-0 sm:ml-36">
                            <h1 className="text-2xl font-bold text-white mb-1">{profileUser?.name}</h1>

                            <div className="flex flex-wrap items-center gap-x-4 text-gray-400 text-sm mb-4">
                                <div className="flex items-center">
                                    <Calendar size={14} className="mr-1 text-yellow-500"/>
                                    <span>Joined {joinedDate}</span>
                                </div>

                                {/* Stats Row */}
                                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                                    <button
                                        onClick={onShowFollowers}
                                        className="flex items-center hover:text-yellow-400 transition-colors cursor-pointer"
                                    >
                    <span className="font-semibold text-white mr-1">
                      {profileUser.followedUsers?.length || 0}
                    </span>
                                        Followers
                                    </button>

                                    <button
                                        onClick={onShowFollowing}
                                        className="flex items-center hover:text-yellow-400 transition-colors cursor-pointer"
                                    >
                    <span className="font-semibold text-white mr-1">
                      {profileUser.followingUsers?.length || 0}
                    </span>
                                        Following
                                    </button>

                                    <div className="flex items-center">
                                        <span className="font-semibold text-white mr-1">{totalPostCount}</span>
                                        Posts
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Section */}
                    {hasProfileDetails && (
                        <div className="px-6 pb-6 border-t border-gray-800 pt-4 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hasBio && (
                                    <div className="md:col-span-2">
                                        <p className="text-gray-300">{profileUser.bio}</p>
                                    </div>
                                )}

                                {hasLocation && (
                                    <div className="flex items-center text-gray-400">
                                        <MapPin size={16} className="mr-2 text-yellow-500"/>
                                        <span>{profileUser.location}</span>
                                    </div>
                                )}

                                {hasWebsite && (
                                    <div className="flex items-center text-gray-400">
                                        <LinkIcon size={16} className="mr-2 text-yellow-500"/>
                                        <a
                                            href={profileUser.website.startsWith("http") ? profileUser.website : `https://${profileUser.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-yellow-400 hover:underline"
                                        >
                                            {profileUser.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}

                                {profileUser?.email && (
                                    <div className="flex items-center text-gray-400">
                                        <Mail size={16} className="mr-2 text-yellow-500"/>
                                        <a
                                            href={`mailto:${profileUser.email}`}
                                            className="text-yellow-400 hover:underline"
                                        >
                                            {profileUser.email}
                                        </a>
                                    </div>
                                )}

                                {(activeGoalsCount > 0 || completedGoalsCount > 0) && (
                                    <div className="space-y-2">
                                        <h3 className="text-white font-semibold flex items-center">
                                            <Target size={16} className="text-yellow-400 mr-2" />
                                            Learning Goals
                                        </h3>
                                        <div className="flex flex-col space-y-2">
                                            {activeGoalsCount > 0 && (
                                                <div className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg">
                                                    <span className="text-sm text-gray-300">Active Goals</span>
                                                    <span className="text-sm font-medium px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-md">
                                                        {activeGoalsCount}
                                                    </span>
                                                </div>
                                            )}
                                            {completedGoalsCount > 0 && (
                                                <div className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg">
                                                    <span className="text-sm text-gray-300">Completed</span>
                                                    <span className="text-sm font-medium px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md">
                                                        {completedGoalsCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {children}
            </div>
        </div>
    );
};

export default ProfileLayout;