"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilRuler, Trash2, Loader2 } from "lucide-react";

const BACKEND_URL = "https://api.jarayuayurved.com/api";

const GoverningBodyDashboard = () => {
  // State management
  const [faculty, setFaculty] = useState([]);
  const [experts, setExperts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    qualification: "",
    achievements: [""],
  });
  const [expertForm, setExpertForm] = useState({
    name: "",
    subject: "",
    image: null,
    imagePreview: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [expertToDelete, setExpertToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'faculty' or 'expert'

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/governing`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        setFaculty(data.faculty || []);
        setExperts(data.experts || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Form handling functions
  const openAddForm = () => {
    setFormData({
      name: "",
      qualification: "",
      achievements: [""],
    });
    setExpertForm({ image: null, imagePreview: null });
    setEditingId(null);
    setActiveSidebar("governing");
  };

  const openEditForm = (member) => {
    setFormData({
      name: member.name,
      qualification: member.qualification,
      achievements: member.achievements,
    });
    setExpertForm({
      image: null,
      imagePreview: member.image,
    });
    setEditingId(member.id);
    setActiveSidebar("governing");
  };

  const openAddExpertForm = () => {
    setExpertForm({
      name: "",
      subject: "",
      image: null,
      imagePreview: null,
    });
    setEditingId(null);
    setActiveSidebar("expert");
  };

  const openEditExpertForm = (expert) => {
    setExpertForm({
      name: expert.name,
      image: null,
      subject: expert.subject,
      imagePreview: expert.image,
    });
    setEditingId(expert.id);
    setActiveSidebar("expert");
  };

  const closeSidebar = () => setActiveSidebar(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAchievementChange = (index, value) => {
    const updated = [...formData.achievements];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, achievements: updated }));
  };

  const addAchievementField = () => {
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const removeAchievementField = (index) => {
    if (formData.achievements.length > 1) {
      const updated = formData.achievements.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, achievements: updated }));
    }
  };

  const handleExpertNameChange = (e) => {
    setExpertForm({ ...expertForm, name: e.target.value });
  };
  const handleExpertSubjectChange = (e) => {
    setExpertForm({ ...expertForm, subject: e.target.value });
  };

  const handleExpertImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setExpertForm({
        image: file,
        imagePreview: previewUrl,
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // API Operations
  const saveMember = async () => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("qualification", formData.qualification);
      formDataToSend.append(
        "achievements",
        JSON.stringify(formData.achievements)
      );

      if (expertForm.image) {
        formDataToSend.append("image", expertForm.image);
      }

      const url = editingId
        ? `${BACKEND_URL}/governing/faculty/${editingId}`
        : `${BACKEND_URL}/governing/faculty`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to save faculty member");
      }

      const updatedFaculty = await response.json();

      setFaculty((prev) =>
        editingId
          ? prev.map((m) => (m.id === editingId ? updatedFaculty : m))
          : [...prev, updatedFaculty]
      );

      closeSidebar();
    } catch (error) {
      console.error("Error saving faculty member:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpertMember = async () => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", expertForm.name);
      formDataToSend.append("subject", expertForm.subject);

      if (expertForm.image) {
        formDataToSend.append("image", expertForm.image);
      }

      const url = editingId
        ? `${BACKEND_URL}/governing/expert/${editingId}`
        : `${BACKEND_URL}/governing/expert`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to save expert");
      }

      const updatedExpert = await response.json();

      setExperts((prev) =>
        editingId
          ? prev.map((e) => (e.id === editingId ? updatedExpert : e))
          : [...prev, updatedExpert]
      );

      closeSidebar();
    } catch (error) {
      console.error("Error saving expert:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/governing/faculty/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete faculty member");
      }

      setFaculty((prev) => prev.filter((member) => member.id !== id));
    } catch (error) {
      console.error("Error deleting faculty member:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpertMember = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/governing/expert/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expert");
      }

      setExperts((prev) => prev.filter((expert) => expert.id !== id));
    } catch (error) {
      console.error("Error deleting expert:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      if (deleteType === "faculty" && memberToDelete) {
        await deleteMember(memberToDelete);
      } else if (deleteType === "expert" && expertToDelete) {
        await deleteExpertMember(expertToDelete);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setMemberToDelete(null);
      setExpertToDelete(null);
      setDeleteType("");
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setMemberToDelete(null);
    setExpertToDelete(null);
    setDeleteType("");
  };

  // Loading state
  if (isLoading && faculty.length === 0 && experts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 overflow-y-auto scrollbar-custom"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-xl font-bold text-blue-800">
              Faculty
            </h1>
            <p className="text-gray-600 text-sm">
              Manage governing body members and their details
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddForm}
            className="w-full md:w-auto  text-sm flex justify-center items-center gap-2 bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-2.5 px-4 rounded-lg shadow-md"
          >
            Add New Faculty
          </motion.button>
        </div>

        {/* Faculty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {faculty.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100 transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              <div className="md:flex p-4 flex-1">
                {/* Image Section */}
                <div className="md:w-2/5 flex flex-col items-center justify-center p-4 border-b border-orange-300 md:border-b-0 md:border-r-2 md:border-orange-300">
                  <div className="relative">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center mb-4 overflow-hidden">
                      {member.image ? (
                        <img
                          src={`https://api.jarayuayurved.com${member.image}`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="md:w-3/5 p-6 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-md font-bold text-orange-500">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium">
                      {member.qualification}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {member.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <p className="ml-3 text-gray-600 text-sm">{achievement}</p>
                      </li>
                    ))}
                  </ul>

                  {/* Buttons at bottom */}
                  <div className="flex justify-end mt-auto pt-4">
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditForm(member)}
                        className="text-blue-700 px-4 py-2 rounded-lg"
                      >
                        <PencilRuler className="inline-block w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setMemberToDelete(member.id);
                          setDeleteType("faculty");
                          setShowConfirm(true);
                        }}
                        className="text-red-700 px-4 py-2 rounded-lg"
                      >
                        <Trash2 className="inline-block w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expert Team Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-8 border border-indigo-200 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto text-center md:text-left">
              <h3 className="text-xl font-bold text-indigo-800">
                Expert Team
              </h3>
              <p className="text-gray-700 text-sm">
                Our team of subject matter experts provides quality guidance to
                students.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddExpertForm}
              className="w-full text-sm md:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-2.5 px-4 rounded-lg shadow-md"
            >
              Add Expert
            </motion.button>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {experts.map((expert) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center group relative"
              >
                <div className="relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 md:w-40 md:h-40 flex items-center justify-center overflow-hidden">
                    {expert.image ? (
                      <img
                        src={`https://api.jarayuayurved.com${expert.image}`}
                        alt={expert.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditExpertForm(expert)}
                      className="bg-blue-500 text-white rounded-full p-2"
                    >
                      <PencilRuler className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setExpertToDelete(expert.id);
                        setDeleteType("expert");
                        setShowConfirm(true);
                      }}
                      className="bg-red-500 text-white rounded-full p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="font-medium text-gray-800">{expert.name}</p>
                </div>
                <div className="mt-1 text-center">
                  <p className="font-medium text-gray-500">{expert.subject}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showConfirm && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {/* Modal */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this{" "}
                      {deleteType === "faculty" ? "faculty member" : "expert"}?
                    </p>

                    <div className="flex justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelDelete}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={confirmDelete}
                        className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-lg shadow-md"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : (
                          "Delete"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Edit Sidebar */}
        <AnimatePresence>
          {activeSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={closeSidebar}
              />

              {/* Governing Body Sidebar */}
              {activeSidebar === "governing" && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed top-0 right-0 w-full max-w-xl h-full bg-white shadow-2xl z-50 overflow-y-auto scrollbar-custom"
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Panel Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <h2 className="text-md font-medium">
                        {editingId ? "Edit Faculty" : "Add New Faculty"}
                      </h2>
                      <button
                        onClick={closeSidebar}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 space-y-6  pb-6 ">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Faculty Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qualification
                        </label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter qualification"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Photo
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center overflow-hidden">
                            {expertForm.imagePreview ? (
                              <img
                                src={
                                  expertForm.imagePreview?.startsWith("blob:")
                                    ? expertForm.imagePreview
                                    : `https://api.jarayuayurved.com/${expertForm.imagePreview?.replace(
                                        /^\/+/,
                                        ""
                                      )}`
                                }
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleExpertImageChange}
                              className="hidden"
                              accept="image/*"
                            />
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={triggerFileInput}
                              className="bg-gradient-to-r text-sm from-orange-300 to-orange-500 text-white font-medium py-2.5 px-2 rounded-lg shadow-md w-md"
                            >
                              {expertForm.imagePreview
                                ? "Change Image"
                                : "Upload Image"}
                            </motion.button>
                            <p className="text-xs text-gray-500 mt-2">
                              JPG, PNG, or GIF (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Achievements
                        </label>
                        <div className="space-y-3">
                          {formData.achievements.map((achievement, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  value={achievement}
                                  onChange={(e) =>
                                    handleAchievementChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-sm pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder={`Achievement ${index + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAchievementField(index)}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addAchievementField}
                            className="flex text-sm items-center gap-2 text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add Achievement
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveMember}
                        disabled={isLoading}
                        className={`flex-1 text-sm bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-3 px-6 rounded-lg shadow-md ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            {editingId ? "Updating..." : "Adding..."}
                          </span>
                        ) : editingId ? (
                          "Update Faculty"
                        ) : (
                          "Add Faculty"
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={closeSidebar}
                        disabled={isLoading}
                        className="flex-1 text-sm bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Expert Team Sidebar */}
              {activeSidebar === "expert" && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto"
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Panel Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <h2 className="text-md font-medium">
                        {editingId ? "Edit Expert" : "Add New Expert"}
                      </h2>
                      <button
                        onClick={closeSidebar}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 space-y-6 overflow-y-auto pb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Photo
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center overflow-hidden">
                            {expertForm.imagePreview ? (
                              <img
                                src={
                                  expertForm.imagePreview?.startsWith("blob:")
                                    ? expertForm.imagePreview
                                    : `https://api.jarayuayurved.com/${expertForm.imagePreview?.replace(
                                        /^\/+/,
                                        ""
                                      )}`
                                }
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleExpertImageChange}
                              className="hidden"
                              accept="image/*"
                            />
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={triggerFileInput}
                              className="bg-gradient-to-r text-sm from-orange-300 to-orange-500 text-white font-medium py-2.5 px-4 rounded-lg shadow-md w-75"
                            >
                              {expertForm.imagePreview
                                ? "Change Image"
                                : "Upload Image"}
                            </motion.button>
                            <p className="text-xs text-gray-500 mt-2">
                              JPG, PNG, or GIF (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expert Name
                        </label>
                        <input
                          type="text"
                          value={expertForm.name ?? ""}
                          onChange={handleExpertNameChange}
                          className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter expert name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expert Subject
                        </label>
                        <input
                          type="text"
                          value={expertForm.subject ?? ""}
                          onChange={handleExpertSubjectChange}
                          className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter expert subject"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4 border-t border-gray-200">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={saveExpertMember}
                        disabled={isLoading}
                        className={`flex-1 text-sm bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-3 px-6 rounded-lg shadow-md ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            {editingId ? "Updating..." : "Adding..."}
                          </span>
                        ) : editingId ? (
                          "Update Expert"
                        ) : (
                          "Add Expert"
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={closeSidebar}
                        disabled={isLoading}
                        className="flex-1 text-sm bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoverningBodyDashboard;
