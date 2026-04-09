"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilRuler,
  Trash2,
  Calendar,
  ImageIcon,
  VideoIcon,
  Youtube,
  InfoIcon,
} from "lucide-react";
import axios from "axios";

const API_URL = "https://api.jarayuayurved.com/api/events";

const EventsWorkshopsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    order: "",
    icon: "🗕",
    dateInfo: "",
    buttonText: "",
    contentType: "",
    link: "",
    discription: "",
    images: [],
    youtubeLinks: [""],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL);
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const openAddForm = () => {
    const maxOrder =
      events.length > 0 ? Math.max(...events.map((e) => e.order || 0)) : 0;
    setFormData({
      title: "",
      type: "",
      order: maxOrder + 1,
      icon: "🗕",
      dateInfo: "",
      buttonText: "",
      contentType: "",
      link: "",
      discription: "",
      images: [],
      youtubeLinks: [""],
    });
    setEditingEvent(null);
    setIsSidebarOpen(true);
  };

  const parseJsonSafely = (value, fallback = []) => {
    try {
      return typeof value === "string" ? JSON.parse(value) : value || fallback;
    } catch (err) {
      console.error("Error parsing JSON field:", err);
      return fallback;
    }
  };

  const openEditForm = (event) => {
    const BASE_URL = "https://api.jarayuayurved.com";

    const normalizeImages = (images) => {
      if (!Array.isArray(images)) return [];

      return images.map((img) => {
        if (typeof img === "string") {
          return {
            name: img.split("/").pop(),
            preview: `${BASE_URL}${img}`, // Don't add a second "/" — already present
          };
        }
        return img; // If already an object (from input)
      });
    };

    const normalizeArray = (data, fallback = []) => {
      return Array.isArray(data) ? data : fallback;
    };

    setFormData({
      ...event,
      discription: event.discription || "",
      images: normalizeImages(event.images),
      videos: normalizeArray(event.videos),
      youtubeLinks: normalizeArray(event.youtubeLinks),
      contentType: event.link ? "link" : "content",
    });

    setEditingEvent(event.id);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contentType: value,
      link: value === "link" ? prev.link : "",
      content: value === "content" ? prev.content : "",
    }));
  };

  const handleYoutubeLinkChange = (index, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.youtubeLinks];
      newLinks[index] = value;
      return { ...prev, youtubeLinks: newLinks };
    });
  };

  const addYoutubeLink = () => {
    setFormData((prev) => ({
      ...prev,
      youtubeLinks: [...prev.youtubeLinks, ""],
    }));
  };

  const removeYoutubeLink = (index) => {
    setFormData((prev) => {
      const newLinks = [...prev.youtubeLinks];
      newLinks.splice(index, 1);
      return { ...prev, youtubeLinks: newLinks };
    });
  };

  const handleFileUpload = async (file, type) => {
    const fileObj = {
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
    };

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], fileObj],
    }));
  };

  const removeFile = (type, index) => {
    setFormData((prev) => {
      const newFiles = [...prev[type]];
      newFiles.splice(index, 1);
      return { ...prev, [type]: newFiles };
    });
  };

  const saveEvent = async () => {
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("type", formData.type);
      form.append("icon", formData.icon);
      form.append("dateInfo", formData.dateInfo);
      form.append("buttonText", formData.buttonText);
      form.append("contentType", formData.contentType);
      form.append("link", formData.link);
      form.append("discription", formData.discription);
      form.append("order", formData.order);
      form.append("youtubeLinks", JSON.stringify(formData.youtubeLinks));

      formData.images.forEach((img) => {
        if (img.file) {
          // New file selected
          form.append("images", img.file);
        }
      });

      if (editingEvent) {
        await axios.put(`${API_URL}/${editingEvent}`, form);
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchEvents();
      closeSidebar();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const confirmDelete = (id) => {
    setEventToDelete(id);
    setShowDeleteModal(true);
  };

  const fieldLabels = {
    title: "Event Title",
    type: "Short Description", // Customize as needed
  };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`${API_URL}/${eventToDelete}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const handleDeleteCancelled = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 scrollbar-custom">
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl font-bold text-blue-800">
              Events & Workshops
            </h1>
            <p className="text-gray-600 text-sm">
              Manage all events and workshops offered by the academy
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddForm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-md"
          >
            Add New Event
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100"
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-md font-bold text-blue-800 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium">
                      {event.type}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <span className="text-indigo-500 text-xl">
                      {event.icon}
                    </span>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 sm:p-3 mb-6 text-center text-sm sm:text-base">
                  <p className="text-indigo-700 font-semibold">
                    {new Date(event.dateInfo).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <div className="px-4 sm:px-6 pb-6 flex flex-col gap-3">
                <button className="w-full text-sm py-3 rounded-lg font-medium transition-colors bg-gradient-to-br from-orange-300 to-orange-500 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg">
                  {event.buttonText}
                </button>
                <div className="flex justify-end gap-5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditForm(event)}
                    className=" text-blue-700 font-medium p-2 rounded-lg"
                  >
                    <PencilRuler className="inline-block w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmDelete(event.id)}
                    className=" text-red-700 font-medium p-2 rounded-lg"
                  >
                    <Trash2 className="inline-block w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-xl">
              <h2 className="text-lg font-semibold text-red-600 mb-3">
                Are you sure?
              </h2>
              <p className="text-gray-700 mb-6">
                Do you really want to delete this Event?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDeleteConfirmed}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={handleDeleteCancelled}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Form */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={closeSidebar}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 w-full max-w-3xl h-full bg-white shadow-2xl z-50 overflow-y-auto scrollbar-hide"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-md font-medium">
                      {editingEvent ? "Edit Event" : "Add New Event"}
                    </h2>
                    <button
                      onClick={closeSidebar}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✖
                    </button>
                  </div>

                  <div className=" space-y-6  pb-6  px-1 sm:px-0">
                    {["title", "type"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {fieldLabels[field] || field}
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className="w-full px-4 text-sm py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}

                    {/* Date Info with Calendar Icon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dateInfo"
                          value={formData.dateInfo}
                          onChange={handleInputChange}
                          className="w-full text-sm pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Select a date"
                        />
                      </div>
                    </div>

                    {/* Icon Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg"
                      >
                        {["🗕", "📅", "🎓", "📚", "🔬", "🎭", "🏆"].map(
                          (emoji) => (
                            <option key={emoji} value={emoji}>
                              {emoji}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Title
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        value={formData["buttonText"]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Link or Content Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Type
                      </label>
                      <select
                        name="contentType"
                        value={formData.contentType}
                        onChange={handleContentTypeChange}
                        className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select An Option</option>
                        <option value="link">Link</option>
                        <option value="content">Content</option>
                      </select>
                    </div>

                    {/* Conditional Fields */}
                    {formData.contentType === "link" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link URL
                        </label>
                        <input
                          type="text"
                          name="link"
                          value={formData.link}
                          onChange={handleInputChange}
                          className="w-full px-4 text-sm py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    {formData.contentType === "content" && (
                      <div className="space-y-6">
                        {/* Content Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            name="discription"
                            value={formData.discription}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter detailed description..."
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            Upload Images
                            <div className="relative group">
                              <InfoIcon className="w-4 h-4 text-gray-400 cursor-pointer" />
                              <div className="absolute left-6 top-1 z-10 hidden w-max rounded-md bg-gray-100 text-dark text-xs px-2 py-1 group-hover:block whitespace-nowrap">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>You can upload a maximum of 6 images.</li>
                                  <li>
                                    To add new images, you must reselect all
                                    images and update event.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </label>

                          <div className="flex items-center gap-3">
                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files);
                                  files.forEach((file) => {
                                    handleFileUpload(file, "images");
                                  });
                                  e.target.value = null;
                                }}
                              />
                              <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500">
                                Add Image
                              </span>
                            </label>

                            <div className="flex flex-wrap gap-2">
                              {formData.images.map((img, index) => (
                                <div key={index} className="relative">
                                  <div className="w-16 h-16 relative rounded-md overflow-hidden border bg-gray-100">
                                    <img
                                      src={img.preview}
                                      alt={img.name || `Image ${index}`}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFile("images", index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                                  >
                                    <span className="text-xs">×</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* YouTube Links */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube Links
                          </label>
                          <div className="space-y-3">
                            {formData.youtubeLinks.map((link, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="flex-1 relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                  </div>
                                  <input
                                    type="text"
                                    value={link}
                                    onChange={(e) =>
                                      handleYoutubeLinkChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://youtube.com/..."
                                  />
                                  {formData.youtubeLinks.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeYoutubeLink(index)}
                                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addYoutubeLink}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <span>+ Add another YouTube link</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4 pb-[80px]">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveEvent}
                      disabled={uploading}
                      className={`flex-1 text-sm bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-3 px-6 rounded-lg shadow-md ${
                        uploading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploading ? (
                        <span>Uploading...</span>
                      ) : editingEvent ? (
                        "Update Event"
                      ) : (
                        "Add Event"
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeSidebar}
                      className="flex-1 text-sm bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventsWorkshopsDashboard;
