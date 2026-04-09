"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, FileText, Plus, X, Calendar } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const Addmission = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks which ID we are editing

  // Input States
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // Stores NEW file upload
  const [currentFileName, setCurrentFileName] = useState(""); // Stores OLD file name (for display)

  // Error/Modal States
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admissions");
      const data = await res.json();

      // Transform DB data to UI format
      const formattedTabs = data.map((item) => ({
        id: item.id,
        title: item.title,
        pdfFile: item.pdf_path
          ? {
              name: item.pdf_name,
              uploadedDate: item.uploaded_date,
              url: item.pdf_path,
            }
          : null,
      }));

      setTabs(formattedTabs);
    } catch (error) {
      console.error("Error loading admissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPER: Format Date ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --- 2. HANDLERS ---

  const startAddingTab = () => {
    setEditingId(null);
    setTitle("");
    setPdfFile(null);
    setCurrentFileName("");
    setErrors({});
    setIsEditing(true);
  };

  const startEditing = (tab) => {
    setEditingId(tab.id); // Set the ID so we know we are updating
    setTitle(tab.title); // Pre-fill title
    setPdfFile(null); // Reset new file (user hasn't picked one yet)

    // Show existing file name so user knows they don't have to re-upload
    if (tab.pdfFile) {
      setCurrentFileName(tab.pdfFile.name);
    } else {
      setCurrentFileName("");
    }

    setErrors({});
    setIsEditing(true);
  };

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 3. SAVE (CREATE OR UPDATE) ---
  const saveChanges = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", title);

    // Only append file if user selected a NEW one
    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }

    try {
      let url = "/api/admissions";
      let method = "POST";

      // If we are editing, change URL and Method
      if (editingId) {
        url = `/api/admissions/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        body: formData,
      });

      if (res.ok) {
        await fetchAdmissions(); // Refresh list
        setIsEditing(false);
      } else {
        alert("Failed to save data to server.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error connecting to server.");
    }
  };

  // --- 4. DELETE FROM DATABASE ---
  const triggerDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await fetch(`/api/admissions/${deleteId}`, {
        method: "DELETE",
      });
      await fetchAdmissions(); // Refresh list
    } catch (error) {
      console.error("Delete error:", error);
    }

    setShowConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Admission
          </h1>
          <button
            onClick={startAddingTab}
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md hover:bg-blue-400/40 transition-colors"
          >
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">
            Loading admissions...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* EMPTY STATE */}
            {tabs.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-3xl">
                <p className="text-slate-400">
                  No admission tabs found. Add one!
                </p>
              </div>
            )}

            {/* LIST OF TABS */}
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-red-50 p-4 rounded-2xl">
                    <FileText size={28} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 mb-1">
                      {tab.title}
                    </h3>

                    {/* DISPLAY DATE */}
                    {tab.pdfFile && tab.pdfFile.uploadedDate && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mb-1">
                        <Calendar size={12} />
                        Uploaded on {formatDate(tab.pdfFile.uploadedDate)}
                      </p>
                    )}

                    {tab.pdfFile ? (
                      <a
                        href={tab.pdfFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400">No PDF uploaded</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(tab)}
                    className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => triggerDelete(tab.id)}
                    className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL FOR ADDING / EDITING */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col p-6"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Admission Tab" : "Add New Admission Tab"}
                  </h2>
                  <button onClick={() => setIsEditing(false)}>
                    <X />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tab Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none"
                      placeholder="e.g. Admission Notification 2025"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      PDF Document
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                      {/* Show currently selected NEW file */}
                      {pdfFile ? (
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <span className="text-sm text-blue-800 truncate">
                            {pdfFile.name}
                          </span>
                          <button
                            onClick={() => setPdfFile(null)}
                            className="text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        // Show Upload Input
                        <div>
                          {/* If editing and has old file, show its name */}
                          {editingId && currentFileName && (
                            <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                              Current File: <strong>{currentFileName}</strong>
                            </div>
                          )}

                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept=".pdf"
                              hidden
                              onChange={handlePdfSelect}
                            />
                            <p className="text-blue-600 font-medium">
                              {editingId
                                ? "Click to Change PDF"
                                : "Click to upload PDF"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Maximum size 5MB
                            </p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t pt-4">
                  <ActionButtons
                    onSave={saveChanges}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteModal
        show={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default Addmission;
