import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  X,
  Search,
  MessageSquare,
  Home,
  FileText,
  Activity,
  Settings,
  BookCheck,
  BrickWallFire, NotebookPen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth/useAuth";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed"); // Default to feed tab
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const notificationRef = useRef(null);
  const profileDropdownRef = useRef(null);

  //get the auth status
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    //set current active tab based on current route
    const path = window.location.pathname;
    if (path.includes("progress")) {
      setActiveTab("progress");
    } else if (path.includes("plans")) {
      setActiveTab("plans");
    } else {
      setActiveTab("feed");
    }

    // This would be replaced with an actual API call
    // Simulating unread notifications
    setUnreadCount(3);
    setNotifications([
      {
        id: 1,
        message: "John Doe liked your post",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        message: "Jane Smith commented on your learning plan",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        message: "Your progress update received 5 likes",
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);

    //click outside to close dropdown handlers
    const handleClickOutside = (event) => {
      if (
          notificationRef.current &&
          !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
          profileDropdownRef.current &&
          !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    //animation state
    setIsLoaded(true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      //logout the user
      logout();
    } catch (error) {
      toast.error("Logout failed:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const navigateToProfile = () => {
    setShowProfileDropdown(false);
    navigate(`/profile/${currentUser?.id}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    //navigate to the corresponding route
    navigate(tab === "feed" ? "/" : `/${tab}`);
  };

  //tabs arrayyy
  const tabItems = [
    { id: "feed", name: "Skill Sharing", icon: <BookCheck  size={20}/> },
    { id: "progress", name: "Learning Progress", icon: <BrickWallFire size={20}/> },
    { id: "plans", name: "Learning Plans", icon: <NotebookPen size={20} /> },
  ];

  return (
      <header className="fixed top-0 left-0 w-full z-50 bg-black shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                  className="mr-3 sm:hidden text-white"
                  onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center cursor-pointer"
              >
                {/* Hexagon Logo */}
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                >
                  <path
                      d="M40 12L69.3 28V60L40 76L10.7 60V28L40 12Z"
                      fill="#F5D13B"
                      stroke="#111111"
                      strokeWidth="2"
                  />
                  <path
                      d="M40 36L54.6 44V60L40 68L25.4 60V44L40 36Z"
                      fill="#111111"
                  />
                  <path
                      d="M30 30L35 33V39L30 42L25 39V33L30 30Z"
                      fill="#FFFFFF"
                  />
                  <path
                      d="M50 30L55 33V39L50 42L45 39V33L50 30Z"
                      fill="#FFFFFF"
                  />
                </svg>

                <h1 className="text-xl font-bold text-white">
                  Task<span className="text-yellow-400">Hive</span>
                </h1>
              </motion.div>
            </div>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {tabItems.map((tab) => (
                  <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`p-2 rounded-lg transition-all duration-200 relative cursor-pointer ${
                          activeTab === tab.id
                              ? "text-yellow-400"
                              : "text-gray-400 hover:text-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex justify-center align-cener">{tab.icon} &nbsp; {tab.name}</span>
                    {activeTab === tab.id && (
                        <motion.div
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"
                            layoutId="activeTabIndicator"
                        />
                    )}
                  </motion.button>
              ))}
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-2">

              {/* Notifications */}
              {/* User Avatar and Menu */}
              <div className="relative" ref={profileDropdownRef}>
                <motion.button
                    className="flex items-center space-x-1 rounded-full hover:bg-gray-800 transition-colors p-1 cursor-pointer"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-yellow-400 cursor-pointer">
                    <UserAvatar
                        src={currentUser?.profileImage}
                        alt={currentUser?.name}
                        name={currentUser?.name}
                        size="h-8 w-8"
                    />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showProfileDropdown && (
                      <motion.div
                          className="absolute right-0 mt-2 w-56 bg-black rounded-lg shadow-lg overflow-hidden z-50 border border-gray-800"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 border-b border-gray-800">
                          <p className="font-medium text-white truncate">
                            {currentUser?.name || "User"}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {currentUser?.email || ""}
                          </p>
                        </div>
                        <div className="py-1">
                          <motion.button
                              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-900 hover:text-yellow-400 transition-colors cursor-pointer"
                              onClick={navigateToProfile}
                              whileHover={{ x: 5 }}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </motion.button>
                          <div className="border-t border-gray-800 my-1"></div>
                          <motion.button
                              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-900 hover:text-red-400 transition-colors cursor-pointer"
                              onClick={handleLogout}
                              whileHover={{ x: 5 }}
                          >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            <span>Logout</span>
                          </motion.button>
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {menuOpen && (
                <motion.div
                    className="sm:hidden py-2 bg-gray-900"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                  {/* Mobile Search */}
                  <div className="px-4 pb-2 pt-1">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                          type="text"
                          placeholder="Search..."
                          className="w-full py-2 pl-4 pr-10 rounded-full bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                          type="submit"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                      >
                        <Search size={18} />
                      </button>
                    </form>
                  </div>

                  {/* Mobile Tabs */}
                  <div className="flex flex-col space-y-1 px-2">
                    {tabItems.map((tab, index) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => {
                              handleTabChange(tab.id);
                              setMenuOpen(false);
                            }}
                            className={`p-3 rounded-lg transition-all duration-200 flex items-center space-x-3
                    ${
                                activeTab === tab.id
                                    ? "bg-gray-800 text-yellow-400"
                                    : "text-gray-300 hover:bg-gray-800"
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                          <span>{tab.icon}</span>
                          <span className="font-medium">{tab.name}</span>
                        </motion.button>
                    ))}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
  );
};

export default Header;