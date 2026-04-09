import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Camera,
  Star,
  Users,
  Award,
  X,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OurInspiration = () => {
  // 1. Updated States to handle Backend Data
  const [inspiration, setInspiration] = useState({
    name: "",
    desc: "",
    image: null,
  });
  const [pillars, setPillars] = useState([]);
  const [principal, setPrincipal] = useState({
    name: "",
    role: "",
    desc: "",
    image: null,
  });
  const [loading, setLoading] = useState(true);

  // 2. UI States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inspiration");
  const [formType, setFormType] = useState("inspiration");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    desc: "",
    image: null,
    fileObject: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingPillarId, setEditingPillarId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // --- DATABASE FETCH LOGIC ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {
      const res = await fetch("/api/authorities");
      const data = await res.json();

      setInspiration({
        name: data.inspiration?.name || "",
        desc: data.inspiration?.description || "",
        image: data.inspiration?.imageUrl || null,
      });

      setPillars(
        (data.pillars || []).map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          desc: p.description,
          image: p.imageUrl,
        })),
      );

      setPrincipal({
        name: data.principal?.name || "",
        role: data.principal?.role || "",
        desc: data.principal?.description || "",
        image: data.principal?.imageUrl || null,
      });

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const updateFormData = (newData) => {
    setFormData(newData);
    setCharCount(newData.desc ? newData.desc.length : 0);
  };

  const handleDescChange = (e) => {
    const input = e.target.value;
    if (input.length <= 150) {
      updateFormData({ ...formData, desc: input });
    }
  };

  // --- Handlers ---
  const handleOpenInspiration = () => {
    setFormType("inspiration");
    setEditMode(true);
    updateFormData({
      name: inspiration.name,
      role: "",
      desc: inspiration.desc,
      image: inspiration.image,
      fileObject: null,
    });
    setIsOpen(true);
  };

  const handleOpenPillars = (mode = "add", pillar = null) => {
    setFormType("pillar");
    setEditMode(mode === "edit");
    if (mode === "edit" && pillar) {
      setEditingPillarId(pillar.id);
      updateFormData({
        name: pillar.name,
        role: pillar.role || "",
        desc: pillar.desc,
        image: pillar.image,
        fileObject: null,
      });
    } else {
      setEditingPillarId(null);
      updateFormData({
        name: "",
        role: "",
        desc: "",
        image: null,
        fileObject: null,
      });
    }
    setIsOpen(true);
  };

  const handleOpenPrincipal = () => {
    setFormType("principal");
    setEditMode(true);
    updateFormData({
      name: principal.name,
      role: principal.role,
      desc: principal.desc,
      image: principal.image,
      fileObject: null,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    updateFormData({
      name: "",
      role: "",
      desc: "",
      image: null,
      fileObject: null,
    });
    setEditingPillarId(null);
    setEditMode(false);
    setCharCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const isSingle = formType === "inspiration" || formType === "principal";
    const endpoint = isSingle ? "/single" : "/pillar";

    const apiData = new FormData();
    apiData.append("type", formType);
    apiData.append("name", formData.name);
    apiData.append("desc", formData.desc);
    apiData.append("role", formData.role);

    if (formData.fileObject) {
      apiData.append("imageFile", formData.fileObject);
    } else {
      apiData.append("existingImage", formData.image || "");
    }

    if (formType === "pillar" && editMode) {
      apiData.append("id", editingPillarId);
    }

    try {
      const response = await fetch(
        `/api/authorities${endpoint}`,
        {
          method: "POST",
          body: apiData,
        },
      );
      if (response.ok) {
        await fetchData();
        handleClose();
      }
    } catch (error) {
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await fetch(
          `/api/authorities/pillar/${deleteConfirm}`,
          {
            method: "DELETE",
          },
        );
        setPillars(pillars.filter((p) => p.id !== deleteConfirm));
        setDeleteConfirm(null);
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const getFormTitle = () => {
    switch (formType) {
      case "inspiration":
        return "Edit Inspiration";
      case "pillar":
        return editMode ? "Edit Pillar" : "Add New Pillar";
      case "principal":
        return "Edit Principal";
      default:
        return "";
    }
  };

  const renderFormContent = () => (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current.click()}
        className="w-52 h-60 border-2 border-dashed border-gray-300 rounded-xl mx-auto flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden bg-gray-50 group relative"
      >
        {formData.image ? (
          <img
            src={formData.image}
            className="w-full h-full object-cover transition-all group-hover:brightness-50"
            alt="preview"
          />
        ) : (
          <div className="text-center text-gray-400 flex flex-col items-center">
            <User
              size={80}
              className="text-gray-200 group-hover:text-gray-300 transition-colors"
            />
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">
              Click to Upload
            </span>
          </div>
        )}
        {formData.image && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={30} className="text-white" />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = (ev) =>
                updateFormData({
                  ...formData,
                  image: ev.target.result,
                  fileObject: file,
                });
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-600">
            Authority Name
          </span>
          <input
            required
            className="w-full mt-1 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={(e) =>
              updateFormData({ ...formData, name: e.target.value })
            }
          />
        </label>
        {(formType === "pillar" || formType === "principal") && (
          <label className="block">
            <span className="text-sm font-bold text-gray-600">
              Designation / Role
            </span>
            <input
              required
              className="w-full mt-1 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.role}
              onChange={(e) =>
                updateFormData({ ...formData, role: e.target.value })
              }
            />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-bold text-gray-600">
            Short Description
          </span>
          <textarea
            required
            rows="6"
            className={`w-full mt-1 border ${charCount > 150 ? "border-red-300" : "border-gray-200"} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none`}
            value={formData.desc}
            onChange={handleDescChange}
            placeholder="Enter description (max 150 characters)"
          />
          <div className="flex justify-end text-xs text-gray-500 mt-1 mr-2">
            <span
              className={charCount > 150 ? "text-red-500" : "text-gray-500"}
            >
              {charCount}/150 characters
            </span>
          </div>
        </label>
      </div>
    </div>
  );

  if (loading)
    return <div className="text-center py-20">Loading Authorities...</div>;

  return (
    <div className="w-full min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex border-b border-gray-200">
            {["inspiration", "pillars", "principal"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-lg font-bold transition-colors flex items-center justify-center gap-3 ${activeTab === tab ? "text-orange-500 border-b-4 border-orange-500" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {tab === "inspiration" ? (
                  <Star size={20} />
                ) : tab === "pillars" ? (
                  <Users size={20} />
                ) : (
                  <Award size={20} />
                )}
                Our {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {activeTab === "inspiration" && (
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center mb-8">
                  <h2 className="text-orange-500 text-2xl mr-2 font-bold">
                    Our Inspiration
                  </h2>
                  <button
                    onClick={handleOpenInspiration}
                    className="p-2 bg-blue-200 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div className="w-60 h-72 rounded-3xl shadow-2xl overflow-hidden mb-8 bg-gray-200 flex items-center justify-center">
                  {inspiration.image ? (
                    <img
                      src={`${inspiration.image}`}
                      className="w-full h-full object-cover"
                    />

                  ) : (
                    <User size={80} className="text-gray-400" />
                  )}
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-orange-600 text-2xl font-semibold mb-2">
                    {inspiration.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {inspiration.desc}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "pillars" && (
              <div className="space-y-8 flex flex-col items-center">
                <div className="w-full flex justify-between items-center">
                  <h2 className="text-orange-500 text-2xl font-bold">
                    Our Pillars
                  </h2>
                  <button
                    onClick={() => handleOpenPillars("add")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-400/30 text-blue-950 rounded-xl font-medium hover:bg-blue-400/50 transition-colors shadow-sm"
                  >
                    <Plus size={18} /> Add Pillar
                  </button>
                </div>
                {pillars.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm w-full">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No pillars added yet
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 w-full max-w-[500px]">
                    {pillars.map((p) => (
                      <div
                        key={p.id}
                        className="flex rounded-2xl w-full overflow-hidden shadow-lg h-48 bg-white border border-gray-100 relative group"
                      >
                        <div className="w-40 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={`${p.image}`}

                              className="w-full h-full object-cover"
                              alt="profile"
                            />
                          ) : (
                            <User size={40} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 p-6 bg-gradient-to-r from-[#fde68a] to-[#86efac] flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {p.name}
                          </h3>
                          <p className="font-semibold text-xs text-gray-800 uppercase mt-1">
                            {p.role}
                          </p>
                          <p className="text-[11px] text-gray-800 mt-3 line-clamp-3 leading-relaxed">
                            {p.desc}
                          </p>
                          <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                              onClick={() => handleOpenPillars("edit", p)}
                              className="p-2 bg-blue-200 text-blue-600 rounded-2xl shadow-sm hover:bg-blue-100"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p.id)}
                              className="p-2 bg-red-200 text-red-600 rounded-2xl shadow-sm hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "principal" && (
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center mb-8">
                  <h2 className="text-orange-500 text-2xl mr-2 font-bold">
                    Our Principal
                  </h2>
                  <button
                    onClick={handleOpenPrincipal}
                    className="p-2 bg-blue-200 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div className="mx-auto flex rounded-2xl w-full max-w-[500px] overflow-hidden shadow-lg h-48 bg-white border border-gray-100 relative">
                  <div className="w-40 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {principal.image ? (
                      <img
                        src={`${principal.image}`}

                        className="w-full h-full object-cover"
                        alt="principal"
                      />
                    ) : (
                      <User size={40} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 p-6 bg-gradient-to-r from-[#fde68a] to-[#86efac] flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {principal.name}
                    </h3>
                    <p className="font-semibold text-xs text-gray-800 uppercase mt-1">
                      {principal.role}
                    </p>
                    <p className="text-[11px] text-gray-800 mt-3 line-clamp-3 leading-relaxed">
                      {principal.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {getFormTitle()}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 flex-1 overflow-y-auto flex flex-col"
              >
                {renderFormContent()}
                <div className="flex gap-3 pt-6 border-t mt-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-blue-400/30 text-blue-950 rounded-xl font-medium hover:bg-blue-400/50 shadow-sm"
                  >
                    {isSaving
                      ? "Saving..."
                      : formType === "pillar" && !editMode
                        ? "Add Pillar"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center">
            <Trash2 className="mx-auto text-red-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pillar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurInspiration;
