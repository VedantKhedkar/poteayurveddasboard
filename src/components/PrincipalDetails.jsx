"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Plus,
  AlertTriangle,
  User,
} from "lucide-react";

const PrincipalManager = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Initial State
  const [principal, setPrincipal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    messageTitle: "",
    content: "",
    qualifications: "",
    experience: "",
    specialization: "",
    email: "",
    mobile: "",
    address: "",
    image: null,
    rawFile: null,
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchPrincipal();
  }, []);

  const fetchPrincipal = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/principal");
      const data = await res.json();

      if (data) {
        // Map DB columns to UI state
        setPrincipal({
          name: data.name,
          title: data.designation,
          messageTitle: data.messageTitle, // ✅ correct
          content: data.content,
          image: data.image_url,
          qualifications: data.qualifications,
          experience: data.experience,
          specialization: data.specialization,
          email: data.email,
          mobile: data.mobile,
          address: data.address,
          designation: data.designation,
        });

      }
    } catch (error) {
      console.error("Error loading principal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. HANDLE SAVE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("designation", formData.designation);
    submitData.append(
      "messageTitle",
      formData.messageTitle || "Principal's Message",
    );
    submitData.append("content", formData.content);
    submitData.append("qualifications", formData.qualifications);
    submitData.append("experience", formData.experience);
    submitData.append("specialization", formData.specialization);
    submitData.append("email", formData.email);
    submitData.append("mobile", formData.mobile);
    submitData.append("address", formData.address);

    // Only append image if a new one was selected
    if (formData.rawFile) {
      submitData.append("image", formData.rawFile);
    }

    try {
      const res = await fetch("/api/principal", {
        method: "PUT",
        body: submitData,
      });

      if (res.ok) {
        await fetchPrincipal(); // Refresh data
        setIsDrawerOpen(false);
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // Handle opening the edit drawer
  const openEditDrawer = () => {
    if (principal) {
      setFormData({
        name: principal.name || "",
        designation: principal.designation || "",
        messageTitle: principal.messageTitle || "",
        content: principal.content || "",
        qualifications: principal.qualifications || "",
        experience: principal.experience || "",
        specialization: principal.specialization || "",
        email: principal.email || "",
        mobile: principal.mobile || "",
        address: principal.address || "",
        image: principal.image, // URL for preview
        rawFile: null, // Reset new file
      });
    } else {
      // Default empty state
      setFormData({
        name: "",
        designation: "",
        messageTitle: "",
        content: "",
        qualifications: "",
        experience: "",
        specialization: "",
        email: "",
        mobile: "",
        address: "",
        image: null,
        rawFile: null,
      });
    }
    setIsDrawerOpen(true);
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">Loading details...</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Principal Details</h1>
        {!principal && (
          <button
            onClick={openEditDrawer}
            className="flex items-center gap-2 px-6 py-2 bg-blue-400/30 text-blue-950 rounded-3xl shadow-md font-semibold"
          >
            <Plus size={18} /> Add Details
          </button>
        )}
      </div>

      {principal ? (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 relative">
          {/* Edit Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={openEditDrawer}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full shadow-sm border border-blue-200 transition-all"
            >
              <Edit2 size={18} />
            </button>
          </div>

          {/* Left Profile Section */}
          <div className="w-full md:w-[35%] bg-[#FFF9F1] p-8 flex flex-col items-center">
            <div className="w-56 h-56 rounded-full bg-[#1D4ED8] border-8 border-white shadow-lg flex items-center justify-center overflow-hidden mb-6 text-white text-3xl font-bold">
              {principal.image ? (
                <img
                  src={`${principal.image}`}
                  alt="Principal"
                  className="w-full h-full object-cover"
                />
              ) : (
                "IMG"
              )}

            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">
              {principal.name}
            </h2>
            <p className="text-orange-600 font-bold text-lg mb-8">
              {principal.title}
            </p>

            <div className="w-full bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 font-bold mb-4">
                <GraduationCap size={20} /> <span>Qualifications</span>
              </div>
              <ul className="space-y-3">
                {principal.qualifications?.split("\n").map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-600 font-medium text-sm"
                  >
                    <span className="text-orange-500 mt-1.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="bg-[#EBF3FF] p-3 rounded-xl text-center">
                <div className="font-bold text-gray-900">
                  {principal.experience}
                </div>
                <div className="text-[10px] text-gray-500 font-bold">
                  Experience
                </div>
              </div>
              <div className="bg-[#EFFFF6] p-3 rounded-xl text-center border border-green-100">
                <div className="font-bold text-green-700">
                  {principal.specialization}
                </div>
                <div className="text-[10px] text-gray-500 font-bold">
                  Specialty
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="w-full md:w-[65%] p-8 md:p-12 flex flex-col">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xl mb-4">
              {principal.messageTitle || "Principal's Message"}
            </div>
            <div className="text-gray-600 leading-relaxed text-sm md:text-base text-justify flex-grow mb-8 whitespace-pre-wrap">
              {principal.content}
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 mt-auto">
              <h4 className="font-bold text-gray-800 mb-4">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Mail size={16} /> {principal.email}
                </div>
                <div className="flex items-center gap-2 text-orange-500 font-medium">
                  <Phone size={16} /> {principal.mobile}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-medium col-span-full">
                  <MapPin size={16} className="text-orange-500" />{" "}
                  {principal.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No principal details found. Click "Add Details".
        </div>
      )}

      {/* EDIT DRAWER */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold">Update Principal Details</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 flex-1 overflow-y-auto space-y-4"
          >
            {/* Image Upload */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative group overflow-hidden bg-gray-50"
            >
              {formData.image ? (
                <img
                  src={formData.image}
                  className="h-full w-full object-cover"
                  alt="Preview"
                />
              ) : (
                <User size={60} className="text-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">
                Change
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      image: URL.createObjectURL(file),
                      rawFile: file,
                    });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Name</label>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Designation
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-2"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Experience
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-2"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">
                  Specialization
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-2"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                Message Title
              </label>
              <input
                className="w-full mt-1 border rounded-lg p-2"
                value={formData.messageTitle}
                onChange={(e) =>
                  setFormData({ ...formData, messageTitle: e.target.value })
                }
                placeholder="e.g. Principal's Message"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                Qualifications (Separate by new line)
              </label>
              <textarea
                rows="3"
                className="w-full mt-1 border rounded-lg p-2"
                value={formData.qualifications}
                onChange={(e) =>
                  setFormData({ ...formData, qualifications: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                Message Content
              </label>
              <textarea
                rows="6"
                className="w-full mt-1 border rounded-lg p-2 text-sm"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>

            <div className="space-y-3">
              <input
                placeholder="Email"
                className="w-full border rounded-lg p-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                placeholder="Mobile"
                className="w-full border rounded-lg p-2"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
              <input
                placeholder="Address"
                className="w-full border rounded-lg p-2"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrincipalManager;
