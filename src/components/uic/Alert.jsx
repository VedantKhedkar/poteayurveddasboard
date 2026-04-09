"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Alert = ({ message, type = "success", show, onClose }) => {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000); 

    return () => clearTimeout(timer); // cleanup on unmount or when show changes
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white ${
            type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{message}</span>
            <button
              onClick={onClose}
              className="font-bold text-lg leading-none hover:text-gray-200"
            >
              <X />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
