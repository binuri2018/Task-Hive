import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, AlertCircle } from "lucide-react";

const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title = "Confirm Action",
                          message = "Are you sure you want to proceed?",
                          confirmText = "Confirm",
                          cancelText = "Cancel",
                          confirmButtonClass = "bg-red-500 hover:bg-red-600",
                          type = "danger", // 'danger', 'warning', or 'info'
                      }) => {
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    let icon = null;
    let iconBgColor = "";
    let modalBorderColor = "";

    if (type === "danger") {
        icon = <AlertCircle className="w-6 h-6" />;
        iconBgColor = "bg-red-900/30 text-red-500";
        modalBorderColor = "border-red-800/50";
        confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white";
    } else if (type === "warning") {
        icon = <AlertTriangle className="w-6 h-6" />;
        iconBgColor = "bg-yellow-900/30 text-yellow-500";
        modalBorderColor = "border-yellow-800/50";
        confirmButtonClass = "bg-yellow-500 hover:bg-yellow-600 text-black";
    } else {
        icon = <Info className="w-6 h-6" />;
        iconBgColor = "bg-blue-900/30 text-blue-500";
        modalBorderColor = "border-blue-800/50";
        confirmButtonClass = "bg-blue-600 hover:bg-blue-700 text-white";
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden border ${modalBorderColor}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        onClick={handleModalClick}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-start space-x-4">
                                <div
                                    className={`p-2.5 rounded-full ${iconBgColor} flex-shrink-0`}
                                >
                                    {icon}
                                </div>
                                <p className="text-gray-300">{message}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 p-4 border-t border-gray-800 bg-gray-800/50">
                            <motion.button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {cancelText}
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${confirmButtonClass}`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {confirmText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;