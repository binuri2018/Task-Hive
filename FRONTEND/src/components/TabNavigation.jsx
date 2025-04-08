import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Activity, FileText } from "lucide-react";

const TabNavigation = ({ activeTab = "feed" }) => {
  const [active, setActive] = useState(activeTab);

  // We'll use this to handle navigation in real implementation
  const handleTabChange = (tab) => {
    setActive(tab);
    // In real implementation, we'd use navigate or history.push here
    window.location.href = `/${tab === "feed" ? "" : tab}`;
  };

  const tabs = [
    { id: "feed", name: "Skill Sharing", icon: <Home size={18} /> },
    { id: "progress", name: "Learning Progress", icon: <Activity size={18} /> },
    { id: "plans", name: "Learning Plans", icon: <FileText size={18} /> },
  ];

  return (
      <div className="bg-gray-900 rounded-xl p-1 flex justify-between shadow-lg border border-gray-800">
        {tabs.map((tab) => (
            <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                    active === tab.id
                        ? "bg-black text-yellow-400"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
              <span>{tab.icon}</span>
              <span className="font-medium text-sm md:text-base">{tab.name}</span>

              {/* Active indicator */}
              {active === tab.id && (
                  <motion.div
                      className="absolute bottom-1 h-0.5 bg-yellow-400 rounded-full"
                      layoutId="activeTabIndicator"
                      initial={{ width: 0 }}
                      animate={{ width: '30%' }}
                      transition={{ duration: 0.3 }}
                  />
              )}
            </motion.button>
        ))}
      </div>
  );
};

export default TabNavigation;