import React, { useState, useEffect } from "react";
import { User, Bookmark, Bell, Settings, Hash, Users, Compass, PlusCircle, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { useAuth } from "../context/auth/useAuth";
import UserAvatar from "../components/UserAvatar";

const suggestedUsers = [
  {
    id: 1,
    name: "Emma Wilson",
    bio: "UI/UX Designer",
    skills: ["Design", "Figma"],
  },
  {
    id: 2,
    name: "Michael Chen",
    bio: "Full Stack Developer",
    skills: ["React", "Node.js"],
  },
  {
    id: 3,
    name: "Sarah Johnson",
    bio: "Data Scientist",
    skills: ["Python", "ML"],
  },
];

const trendingTopics = [
  { id: 1, name: "React Hooks", count: 342 },
  { id: 2, name: "CSS Grid", count: 275 },
  { id: 3, name: "UX Design", count: 189 },
  { id: 4, name: "Python", count: 156 },
];

const MainLayout = ({ children, activeTab }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
  }, [currentUser]);

  return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <Header activeTab={activeTab} />

        {/* Main content with side columns */}
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <motion.div
                className="hidden lg:block lg:col-span-3 space-y-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                transition={{ duration: 0.5 }}
            >
              {/* User Profile Card */}
              <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                {/* Cover Image */}
                <div className="h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 relative">
                  {/* Honeycomb Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                  }}></div>
                </div>

                {/* Profile Details */}
                <div className="p-4 relative">
                  <div className="absolute -top-10 left-4 border-4 border-gray-900 rounded-full">
                    <UserAvatar
                        src={currentUser?.profileImage}
                        alt={currentUser?.name}
                        name={currentUser?.name}
                        size="h-16 w-16"
                    />
                  </div>

                  <div className="ml-16 mt-2 mb-4">
                    <h3 className="font-bold text-lg text-white truncate">
                      {currentUser?.name || "User Name"}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {currentUser?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="col-span-1 lg:col-span-6 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Render the specific tab content */}
              {children}
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
                className="hidden lg:block lg:col-span-3 space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Featured Skills */}
              <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center">
                    <Sparkles size={16} className="mr-2 text-yellow-400" />
                    Featured Skills
                  </h3>
                  <button className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center">
                    <PlusCircle size={14} className="mr-1" />
                    Add Skill
                  </button>
                </div>
                <div className="p-3">
                  <div className="space-y-3">
                    {['JavaScript', 'React', 'Node.js', 'UI Design'].map((skill, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-lg relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-yellow-400" style={{ width: `${(4-index) * 25}%`, opacity: 0.2 }}></div>
                          <div className="relative flex justify-between items-center">
                            <p className="text-white font-medium">{skill}</p>
                            <span className="text-yellow-400 text-sm">{(4-index) * 25}%</span>
                          </div>
                        </div>
                    ))}
                    <button className="w-full py-2 text-sm text-center bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
                      View All Skills
                    </button>
                  </div>
                </div>
              </div>
              {/* Trending Topics */}
              <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center">
                    <TrendingUp size={16} className="mr-2 text-yellow-400" />
                    Trending Topics
                  </h3>
                  <span className="text-xs px-2 py-1 bg-yellow-400 text-black rounded-full">Hot</span>
                </div>
                <div className="p-2">
                  <div className="space-y-1">
                    {trendingTopics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: isLoaded ? 1 : 0,
                              x: isLoaded ? 0 : -20,
                            }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center space-x-2">
                            <Hash size={16} className="text-yellow-400" />
                            <span className="text-gray-300">{topic.name}</span>
                          </div>
                          <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-1 rounded-full">
                        {topic.count}
                      </span>
                        </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default MainLayout;