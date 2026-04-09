"use client";
import React, { useState, useEffect, useRef } from "react";
import { PencilRuler, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButtons from "../uic/ActionButtons";

const MEDIA_Download =
  "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";
const MEDIA_Upload =
  "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";

const API_BASE = "https://api.jarayuayurved.com"; // backend for news CRUD

const NewsDashboard = () => {
  const [newsList, setNewsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    image: null,
    imagePreview: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news from backend
  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news`);
      const data = await res.json();
      setNewsList(
        data.map((item) => ({
          ...item,
          imagePreview: item.image ? `${MEDIA_Download}/${item.image}` : null,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  // Upload image to MEDIA_Upload
  const uploadFileToServer = async (file) => {
    if (!file) return null;
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(MEDIA_Upload, { method: "POST", body: form });
      const data = await res.json();
      if (data.uploadedImages && data.uploadedImages.length > 0)
        return data.uploadedImages[0].filename;
      return null;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  // Start editing
  const startEditing = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      content: item.content,
      image: null,
      imagePreview: item.imagePreview || null,
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Start adding
  const startAdding = () => {
    setEditingId(null);
    setFormData({ name: "", content: "", image: null, imagePreview: null });
    setIsEditing(true);
    setIsAdding(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", content: "", image: null, imagePreview: null });
  };

  // Handle file input change
  const handleFileChange = (file) => {
    if (!file) return;
    setFormData({
      ...formData,
      image: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  // Save news
  const saveChanges = async () => {
    try {
      let uploadedFilename = await uploadFileToServer(formData.image);

      const payload = {
        name: formData.name,
        content: formData.content,
        image:
          uploadedFilename ||
          (formData.imagePreview
            ? formData.imagePreview.split("/").pop()
            : null),
      };

      const url = editingId
        ? `${API_BASE}/api/news/${editingId}`
        : `${API_BASE}/api/news`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      setNewsList((prev) =>
        editingId
          ? prev.map((item) =>
              item.id === editingId
                ? {
                    ...result,
                    imagePreview: payload.image
                      ? `${MEDIA_Download}/${payload.image}`
                      : null,
                  }
                : item
            )
          : [
              {
                ...result,
                imagePreview: payload.image
                  ? `${MEDIA_Download}/${payload.image}`
                  : null,
              },
              ...prev,
            ]
      );

      cancelEditing();
    } catch (err) {
      console.error("Failed to save news:", err);
    }
  };

  // Delete news
  const deleteNews = async (id) => {
    try {
      await fetch(`${API_BASE}/api/news/${id}`, { method: "DELETE" });
      setNewsList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete news:", err);
    }
  };

  return (
    <div className="h-screen overflow-y-auto scrollbar-custom bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between gap-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              News Management
            </h1>
            <p className="text-gray-600 max-w-2xl text-sm">
              Manage news articles and posts
            </p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAdding}
            className="bg-blue-400/30 hover:bg-blue-400/40 text-sm text-blue-900 font-medium py-2 px-10 rounded-lg"
          >
            Add 
          </motion.button>
        </div>

        {/* News List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newsList.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center"
            >
              {/* Image */}
              <div className="w-32 h-32 md:w-full md:h-40 mb-2">
                {item.imagePreview ? (
                  <img
                    src={item.imagePreview}
                    alt={item.name}
                    className="w-full h-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 border-2 border-dashed rounded-xl text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-sm md:text-base font-bold text-indigo-800 mb-2 text-center">
                {item.name}
              </h3>

              {/* Content */}
              {/* <p className="text-gray-600 text-sm md:text-base mb-4 text-center max-h-28 overflow-y-auto scrollbar-custom">
                {item.content}
              </p> */}

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-4">
                <motion.button
                  onClick={() => startEditing(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilRuler className="h-4 w-4 md:h-5 md:w-5" />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit/Add Drawer */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-full sm:max-w-2xl h-full bg-white shadow-2xl z-50 overflow-y-auto scrollbar-custom"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h2 className="text-md font-medium">
                    {isAdding ? "Add News" : "Edit News"}
                  </h2>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed flex justify-center items-center overflow-hidden bg-gray-100">
                      {formData.imagePreview ? (
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files[0])}
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current.click()}
                        className="bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 px-4 py-2 rounded"
                      >
                        {formData.imagePreview
                          ? "Change Image"
                          : "Upload Image"}
                      </motion.button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <ActionButtons
                  isAdding={isAdding}
                  onSave={saveChanges}
                  onCancel={cancelEditing}
                  addText="Add News"
                  saveText="Save News"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-600 mb-6">
              Do you really want to delete this news item?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  deleteNews(itemToDelete);
                  setShowConfirm(false);
                  setItemToDelete(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setItemToDelete(null);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDashboard;
