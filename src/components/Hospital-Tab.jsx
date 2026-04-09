"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Trash2,
  FileText,
  Plus,
  X,
  Folder,
  Upload,
  Calendar,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const Hospital = () => {
  const [tabs, setTabs] = useState([]); // Initialize empty for backend data
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [sectionDeleteWarning, setSectionDeleteWarning] = useState({
    show: false,
    sectionId: null,
  });
  const [tabDeleteWarning, setTabDeleteWarning] = useState({
    show: false,
    tabId: null,
  });

  // Delete configuration state
  const [deleteConfig, setDeleteConfig] = useState({
    type: null,
    tabId: null,
    sectionId: null,
    pdfId: null,
  });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingPdf, setEditingPdf] = useState({
    sectionId: null,
    pdfId: null,
    currentFileName: null,
  });
  const [formData, setFormData] = useState({ title: "", sections: [] });
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isPdfModified, setIsPdfModified] = useState(false);

  // Track original data when editing starts
  const [originalFormData, setOriginalFormData] = useState(null);
  // Track if we're editing an existing tab
  const [isEditingExistingTab, setIsEditingExistingTab] = useState(false);

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/hospital");
      const data = await res.json();

      const transformed = data.map(tab => ({
        id: tab.id,
        title: tab.title,
        sections: (tab.sections || []).map(section => ({
          id: section.id,
          sectionTitle: section.title, // map title → sectionTitle
          pdfFiles: (section.pdfs || []).map(pdf => ({
            id: pdf.id,
            name: pdf.name,
            url: pdf.pdfPath, // map pdfPath → url
            uploadedDate: pdf.uploadedDate,
          }))
        }))
      }));

      setTabs(transformed);

    } catch (error) {
      console.error("Error loading hospital data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Track changes in PDF form
  useEffect(() => {
    if (editingPdf.pdfId) {
      // Find the current PDF being edited
      const section = formData.sections.find(
        (s) => s.id === editingPdf.sectionId,
      );
      if (!section) return;

      const currentPdf = section.pdfFiles.find(
        (p) => p.id === editingPdf.pdfId,
      );
      if (!currentPdf) return;

      // Check if title changed
      const isTitleChanged = pdfTitle !== currentPdf.name;
      // Check if file changed
      const isFileChanged = pdfFile !== null;

      setIsPdfModified(isTitleChanged || isFileChanged);
    } else {
      // For new PDF, enable upload if there's a file
      setIsPdfModified(pdfFile !== null || pdfTitle.trim() !== "");
    }
  }, [pdfTitle, pdfFile, editingPdf, formData]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get current date for new uploads
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  // --- VALIDATION FUNCTIONS ---

  const validateForm = () => {
    const newErrors = {};

    // Validate tab title
    if (!formData.title.trim()) {
      newErrors.title = "Tab title is required";
    }

    // For NEW tabs, validate that at least one section is required
    if (!isEditingExistingTab && formData.sections.length === 0) {
      newErrors.sections = "At least one section is required for new tabs";
    }

    // Validate each section's title (only if section exists)
    formData.sections.forEach((section, index) => {
      if (!section.sectionTitle.trim()) {
        newErrors[`section-${section.id}`] =
          `Section ${index + 1} title is required`;
      }

      // For NEW sections in existing tabs, or for all sections in new tabs
      // Allow empty sections in existing tabs (no PDF validation)
      if (!isEditingExistingTab && section.pdfFiles.length === 0) {
        newErrors[`section-pdf-${section.id}`] =
          `Section ${index + 1} must have at least one PDF for new tabs`;
      }
    });

    return newErrors;
  };

  // Clear errors when user starts typing
  const handleTabTitleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, title: value });

    // Clear error when user starts typing
    if (errors.title && value.trim()) {
      setErrors((prev) => ({ ...prev, title: null }));
    }
  };

  const handleSectionTitleChange = (sId, val) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sId ? { ...s, sectionTitle: val } : s,
      ),
    }));

    // Clear error when user starts typing
    if (errors[`section-${sId}`] && val.trim()) {
      setErrors((prev) => ({ ...prev, [`section-${sId}`]: null }));
    }
  };

  // --- DELETE HANDLERS ---

  const triggerDeleteTab = (id) => {
    const tab = tabs.find((t) => t.id === id);

    // Check if tab has sections
    if (tab && tab.sections && tab.sections.length > 0) {
      setTabDeleteWarning({ show: true, tabId: id });
      return;
    }

    setDeleteConfig({ type: "TAB", tabId: id });
    setShowConfirm(true);
  };

  const triggerDeleteSection = (sId) => {
    setDeleteConfig({ type: "SECTION", sectionId: sId });
    setShowConfirm(true);
  };

  const triggerDeletePdf = (sId, pdfId) => {
    setDeleteConfig({ type: "PDF", sectionId: sId, pdfId: pdfId });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { type, tabId, sectionId, pdfId } = deleteConfig;

    if (type === "TAB") {
      try {
        await fetch(`/api/hospital/${tabId}`, {
          method: "DELETE",
        });
        await fetchHospitalData();
      } catch (err) {
        console.error(err);
      }

      // Close warning if it was showing for this tab
      if (tabDeleteWarning.tabId === tabId) {
        setTabDeleteWarning({ show: false, tabId: null });
      }
    } else if (type === "SECTION") {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      }));

      // Clear section errors when deleting a section
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`section-${sectionId}`];
        delete newErrors[`section-pdf-${sectionId}`];
        return newErrors;
      });

      // Clear sections error if we have at least one section
      if (formData.sections.length > 1) {
        setErrors((prev) => ({ ...prev, sections: null }));
      }
    } else if (type === "PDF") {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId
            ? {
              ...s,
              pdfFiles: s.pdfFiles.filter((p) => p.id !== pdfId),
            }
            : s,
        ),
      }));
      resetPdfForm();

      // Clear PDF error when deleting the last PDF
      const section = formData.sections.find((s) => s.id === sectionId);
      if (section && section.pdfFiles.length === 1) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`section-pdf-${sectionId}`];
          return newErrors;
        });
      }
    }

    setShowConfirm(false);
    setDeleteConfig({ type: null, tabId: null, sectionId: null, pdfId: null });
  };

  const handleCloseSectionWarning = () => {
    setSectionDeleteWarning({ show: false, sectionId: null });
  };

  const handleCloseTabWarning = () => {
    setTabDeleteWarning({ show: false, tabId: null });
  };

  // --- OTHER LOGIC ---

  const startEditing = (tab) => {
    setEditingId(tab.id);
    const tabCopy = JSON.parse(JSON.stringify(tab));
    setFormData(tabCopy);
    setOriginalFormData(tabCopy); // Save original data
    setIsEditing(true);
    setIsEditingExistingTab(true); // Mark as editing existing tab
    setEditingSectionId(null);
    resetPdfForm();
    setErrors({}); // Clear errors when starting to edit
    setSectionDeleteWarning({ show: false, sectionId: null }); // Clear any warning
    setTabDeleteWarning({ show: false, tabId: null }); // Clear any tab warning
  };

  const startAddingTab = () => {
    setEditingId(null);
    setFormData({ title: "", sections: [] });
    setOriginalFormData(null);
    setIsEditing(true);
    setIsEditingExistingTab(false); // Mark as new tab
    resetPdfForm();
    setErrors({}); // Clear errors when starting to add
    setSectionDeleteWarning({ show: false, sectionId: null }); // Clear any warning
    setTabDeleteWarning({ show: false, tabId: null }); // Clear any tab warning
  };

  const addSection = () => {
    const newId = Date.now();
    const newSection = {
      id: newId,
      sectionTitle: "",
      pdfFiles: [],
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setEditingSectionId(newId);

    // Clear section error when adding a section
    if (errors.sections) {
      setErrors((prev) => ({ ...prev, sections: null }));
    }
  };

  const updateSectionTitle = (sId, val) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sId ? { ...s, sectionTitle: val } : s,
      ),
    }));
  };

  const handleSectionCancel = (sId) => {
    const section = formData.sections.find((s) => s.id === sId);

    // Only remove the section if it's a new section with no title and no PDFs
    // Existing sections should revert to original state on cancel
    if (
      section &&
      !section.sectionTitle.trim() &&
      section.pdfFiles.length === 0
    ) {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sId),
      }));
    } else if (originalFormData) {
      // Find the original section data
      const originalSection = originalFormData.sections.find(
        (s) => s.id === sId,
      );
      if (originalSection) {
        // Revert to original section data
        setFormData((prev) => ({
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === sId ? { ...originalSection } : s,
          ),
        }));
      }
    }

    // Exit edit mode
    setEditingSectionId(null);

    // Clear errors for this section
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`section-${sId}`];
      delete newErrors[`section-pdf-${sId}`];
      return newErrors;
    });
  };

  const handleSectionSave = (sId) => {
    const section = formData.sections.find((s) => s.id === sId);
    if (!section) return;

    // Validate section title
    if (!section.sectionTitle.trim()) {
      setErrors((prev) => ({
        ...prev,
        [`section-${sId}`]: "Section title is required",
      }));
      return;
    }

    // Only validate PDFs for new sections or new tabs
    if (!isEditingExistingTab && section.pdfFiles.length === 0) {
      setErrors((prev) => ({
        ...prev,
        [`section-pdf-${sId}`]: "At least one PDF is required for new sections",
      }));
      return;
    }

    // Save the section title and exit edit mode
    setEditingSectionId(null);

    // Clear errors for this section
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`section-${sId}`];
      delete newErrors[`section-pdf-${sId}`];
      return newErrors;
    });
  };

  const handlePdfFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
    // Auto-fill title if not already set and not editing
    if (!pdfTitle.trim() && !editingPdf.pdfId) {
      setPdfTitle(file.name.replace(".pdf", "").replace(".PDF", ""));
    }
  };

  const handlePdfUpload = (sectionId) => {
    if (!pdfFile && !editingPdf.pdfId) {
      alert("Please select a PDF file");
      return;
    }

    const finalTitle =
      pdfTitle.trim() ||
      (pdfFile
        ? pdfFile.name.replace(".pdf", "").replace(".PDF", "")
        : editingPdf.currentFileName || "Untitled PDF");

    const tempId = pdfFile
      ? `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : null;

    const newPdf = {
      id: editingPdf.pdfId || Date.now(),
      name: finalTitle,
      uploadedDate: editingPdf.pdfId ? getCurrentDate() : getCurrentDate(),
      rawFile: pdfFile,
      tempId: tempId,
      url: editingPdf.pdfId && !pdfFile ? editingPdf.currentUrl : null,
    };

    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
            ...s,
            pdfFiles: editingPdf.pdfId
              ? s.pdfFiles.map((p) =>
                p.id === editingPdf.pdfId ? newPdf : p,
              ) // Update existing
              : [...s.pdfFiles, newPdf], // Add new
          }
          : s,
      ),
    }));

    // Clear PDF error when a PDF is uploaded
    if (errors[`section-pdf-${sectionId}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`section-pdf-${sectionId}`];
        return newErrors;
      });
    }

    // Reset PDF upload state
    resetPdfForm();
  };

  const resetPdfForm = () => {
    setPdfTitle("");
    setPdfFile(null);
    setEditingPdf({ sectionId: null, pdfId: null, currentFileName: null });
    setIsPdfModified(false);
  };

  const cancelPdfEdit = () => {
    resetPdfForm();
  };

  const startPdfEdit = (sectionId, pdfId, currentPdf = null) => {
    if (currentPdf) {
      setEditingPdf({
        sectionId,
        pdfId,
        currentFileName: currentPdf.name,
        currentUrl: currentPdf.url,
      });
      setPdfTitle(currentPdf.name);
    } else {
      setEditingPdf({ sectionId, pdfId: null, currentFileName: null });
      setPdfTitle("");
    }
    setPdfFile(null);
    setIsPdfModified(false);
  };

  // --- SAVE CHANGES TO BACKEND ---
  const saveChanges = async () => {
    // Validate the form
    const validationErrors = validateForm();

    // Check if there are any sections being edited
    if (editingSectionId !== null) {
      // Validate the current editing section
      const currentSection = formData.sections.find(
        (s) => s.id === editingSectionId,
      );
      if (currentSection) {
        if (!currentSection.sectionTitle.trim()) {
          validationErrors[`section-${currentSection.id}`] =
            "Section title is required";
        }
        // Only validate PDFs for new sections or new tabs
        if (!isEditingExistingTab && currentSection.pdfFiles.length === 0) {
          validationErrors[`section-pdf-${currentSection.id}`] =
            "At least one PDF is required for new sections";
        }
      }
    }

    // Check if there are any errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop saving if there are errors
    }

    const submitData = new FormData();

    // Prepare JSON payload (stripping raw files for clean JSON)
    const cleanSections = formData.sections.map((sec) => ({
      sectionTitle: sec.sectionTitle,
      pdfFiles: sec.pdfFiles.map((p) => ({
        name: p.name,
        url: p.url,
        tempId: p.tempId,
      })),
    }));

    const jsonPayload = {
      id: editingId && String(editingId).length < 10 ? editingId : null,
      title: formData.title,
      sections: cleanSections,
    };

    submitData.append("tabData", JSON.stringify(jsonPayload));

    // Append binary files
    formData.sections.forEach((sec) => {
      sec.pdfFiles.forEach((p) => {
        if (p.rawFile && p.tempId) {
          submitData.append(p.tempId, p.rawFile);
        }
      });
    });

    try {
      const res = await fetch("/api/hospital", {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        await fetchHospitalData();
        setIsEditing(false);
        resetPdfForm();
        setEditingSectionId(null);
        setErrors({}); // Clear errors after successful save
        setSectionDeleteWarning({ show: false, sectionId: null }); // Clear any warning
        setTabDeleteWarning({ show: false, tabId: null }); // Clear any tab warning
      } else {
        alert("Failed to save data");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospital
          </h1>
          <button
            onClick={startAddingTab}
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md"
          >
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">
            Loading data...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`relative bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center group ${tabDeleteWarning.show && tabDeleteWarning.tabId === tab.id
                    ? "border-red-300"
                    : "border-slate-200"
                  }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between ">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800">
                        {tab.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {tab.sections?.length || 0} section
                      </p>
                    </div>

                    {/* Warning between title and buttons */}
                    {tabDeleteWarning.show &&
                      tabDeleteWarning.tabId === tab.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mx-4 flex-1 max-w-4xl"
                        >
                          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="bg-red-100 p-1 rounded">
                                <AlertCircle
                                  size={14}
                                  className="text-red-600"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-800">
                                  Cannot Delete Tab
                                </p>
                                <p className="text-xs text-red-700">
                                  Delete all sections first
                                </p>
                              </div>
                              <button
                                onClick={handleCloseTabWarning}
                                className="text-red-500 hover:text-red-700 p-0.5"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(tab)}
                        className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => triggerDeleteTab(tab.id)}
                        className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <h2 className="text-xl font-semibold text-slate-800">
                    {editingId ? "Update Hospital" : "Add Hospital"}
                  </h2>
                  <button
                    onClick={() => {
                      // When closing the entire modal, restore original form data
                      if (originalFormData) {
                        setFormData(originalFormData);
                      }
                      setIsEditing(false);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  {/* Tab Title Field with Error */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-medium text-slate-800">
                        Tab Title *
                      </label>
                      {errors.title && (
                        <div className="flex items-center gap-1 text-red-500 text-xs">
                          <AlertCircle size={12} />
                          <span>Required</span>
                        </div>
                      )}
                    </div>
                    <input
                      className={`w-full text-lg font-normal border-2 rounded-xl p-2 outline-none transition-all ${errors.title
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                        }`}
                      value={formData.title}
                      onChange={handleTabTitleChange}
                      placeholder="Enter tab title"
                    />
                  </div>

                  <div className="space-y-10 pb-10">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <Folder size={18} className="text-blue-500" /> Content
                          Sections
                        </h4>
                        {errors.sections && (
                          <div className="flex items-center gap-1 text-red-500 text-xs">
                            <AlertCircle size={12} />
                            <span>{errors.sections}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={addSection}
                        disabled={editingSectionId !== null}
                        className={`text-blue-600 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${editingSectionId !== null
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-blue-50"
                          }`}
                      >
                        <Plus size={16} /> Add New Section
                      </button>
                    </div>

                    {/* Sections List */}
                    {formData.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`relative p-6 rounded-3xl border transition-all ${editingSectionId === section.id ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-center mb-6">
                          {/* Left side: Section title */}
                          <div className="flex-1">
                            {editingSectionId === section.id ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    autoFocus
                                    className={`bg-white mr-2 px-3 py-2 rounded-lg border text-lg font-normal text-slate-800 outline-none flex-1 ${errors[`section-${section.id}`]
                                        ? "border-red-300"
                                        : "border-blue-400"
                                      }`}
                                    value={section.sectionTitle}
                                    onChange={(e) =>
                                      handleSectionTitleChange(
                                        section.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter section title"
                                  />
                                </div>
                                {errors[`section-${section.id}`] && (
                                  <div className="flex items-center gap-1 text-red-500 text-xs ml-2">
                                    <AlertCircle size={12} />
                                    <span>Required</span>
                                  </div>
                                )}
                                {errors[`section-pdf-${section.id}`] && (
                                  <div className="flex items-center gap-1 text-red-500 text-xs ml-2">
                                    <AlertCircle size={12} />
                                    <span>At least one PDF is required</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <h5 className="text-lg font-normal text-slate-800">
                                {section.sectionTitle || "Untitled Section"}
                              </h5>
                            )}
                          </div>

                          {/* Right side: Edit/Save/Cancel buttons */}
                          <div className="flex gap-2">
                            {editingSectionId === section.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleSectionCancel(section.id)
                                  }
                                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 bg-slate-200 rounded-xl transition-colors text-sm font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSectionSave(section.id)}
                                  className="px-4 py-2 bg-blue-400/30 text-blue-950   rounded-xl transition-colors text-sm font-medium"
                                >
                                  Save
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setEditingSectionId(section.id)
                                  }
                                  disabled={
                                    editingSectionId !== null &&
                                    editingSectionId !== section.id
                                  }
                                  className={`p-2 text-blue-600 rounded-3xl transition-colors ${editingSectionId !== null &&
                                      editingSectionId !== section.id
                                      ? "opacity-50 cursor-not-allowed bg-blue-50"
                                      : "hover:bg-blue-50 bg-blue-100"
                                    }`}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    triggerDeleteSection(section.id)
                                  }
                                  disabled={editingSectionId !== null}
                                  className={`p-2 text-red-600 rounded-3xl transition-colors ${editingSectionId !== null
                                      ? "opacity-50 cursor-not-allowed bg-red-50"
                                      : "hover:bg-red-50 bg-red-100"
                                    }`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* PDF Files Section */}
                        <div className="space-y-4">
                          {/* Existing PDF Files Display */}
                          {section.pdfFiles.map((pdf) => (
                            <div
                              key={pdf.id}
                              className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 items-center shadow-sm"
                            >
                              <div className="bg-red-50 p-4 rounded-xl">
                                <FileText size={28} className="text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="mb-1">
                                  <h5 className="text-sm font-medium text-slate-800 truncate">
                                    {pdf.name}
                                  </h5>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <span>
                                    Uploaded on {formatDate(pdf.uploadedDate)}
                                  </span>
                                </div>
                              </div>
                              {/* Show edit/delete buttons only when section is being edited */}
                              {editingSectionId === section.id && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      startPdfEdit(section.id, pdf.id, pdf)
                                    }
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      triggerDeletePdf(section.id, pdf.id)
                                    }
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* PDF Upload/Edit Section - Only show when section is being edited */}
                          {editingSectionId === section.id && (
                            <div className="space-y-4">
                              {/* Show upload form only when editing this section's PDF or when adding new PDF */}
                              {(editingPdf.sectionId === section.id ||
                                section.pdfFiles.length === 0) && (
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-xs font-medium text-slate-700 mb-1 block">
                                          {editingPdf.pdfId
                                            ? "Edit PDF"
                                            : "Add New PDF *"}
                                        </label>

                                        {/* Show current file info when editing */}
                                        {editingPdf.pdfId &&
                                          editingPdf.currentFileName && (
                                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                              <div className="flex items-center gap-2">
                                                <FileText
                                                  size={16}
                                                  className="text-blue-500"
                                                />
                                                <span className="text-xs font-medium text-slate-700">
                                                  Current File:
                                                </span>
                                                <span className="text-xs text-slate-600 truncate">
                                                  {editingPdf.currentFileName}
                                                </span>
                                              </div>
                                            </div>
                                          )}

                                        <input
                                          type="text"
                                          value={pdfTitle}
                                          onChange={(e) =>
                                            setPdfTitle(e.target.value)
                                          }
                                          className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-3"
                                          placeholder="Enter PDF title"
                                        />

                                        <div className="flex items-center gap-3">
                                          {pdfFile ? (
                                            <div className="flex-1 flex items-center justify-between bg-white p-3 rounded-lg border">
                                              <div className="flex items-center gap-3">
                                                <div className="bg-red-50 p-2 rounded-lg">
                                                  <FileText
                                                    size={20}
                                                    className="text-red-500"
                                                  />
                                                </div>
                                                <span className="text-sm font-medium truncate">
                                                  {pdfFile.name}
                                                </span>
                                              </div>
                                              <button
                                                onClick={() => setPdfFile(null)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                type="button"
                                              >
                                                <X size={16} />
                                              </button>
                                            </div>
                                          ) : (
                                            <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                                              <span className="text-sm font-medium text-slate-700">
                                                {editingPdf.pdfId
                                                  ? "Choose new PDF file "
                                                  : "Choose PDF File *"}
                                              </span>
                                              <input
                                                type="file"
                                                accept=".pdf"
                                                hidden
                                                onChange={handlePdfFileSelect}
                                                required
                                              />
                                            </label>
                                          )}

                                          <div className="flex gap-2">
                                            <button
                                              onClick={() =>
                                                handlePdfUpload(section.id)
                                              }
                                              disabled={!isPdfModified}
                                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isPdfModified
                                                  ? "bg-blue-400/30 text-blue-950 cursor-pointer"
                                                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                }`}
                                            >
                                              {editingPdf.pdfId
                                                ? "Update"
                                                : "Upload"}
                                            </button>
                                            <button
                                              onClick={cancelPdfEdit}
                                              className="px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                                              type="button"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                        {!isEditingExistingTab && (
                                          <div className="text-xs text-slate-500 mt-2">
                                            * At least one PDF is required to save
                                            this section
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Show "Add PDF" button when section has PDFs but not currently editing a PDF */}
                              {section.pdfFiles.length > 0 &&
                                editingPdf.sectionId !== section.id && (
                                  <button
                                    onClick={() =>
                                      startPdfEdit(section.id, null)
                                    }
                                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Plus size={18} />
                                    <span className="font-medium">
                                      Add Another PDF
                                    </span>
                                  </button>
                                )}
                            </div>
                          )}

                          {/* Message when section is not in edit mode and has no PDFs */}
                          {editingSectionId !== section.id &&
                            section.pdfFiles.length === 0 && (
                              <div className="text-center py-4 text-slate-400 text-sm">
                                No PDFs uploaded{" "}
                                {isEditingExistingTab
                                  ? "(Optional for existing tabs)"
                                  : ""}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}

                    {/* Show message when no sections exist */}
                    {formData.sections.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                        <Folder
                          size={48}
                          className="mx-auto text-slate-400 mb-3"
                        />
                        <p className="text-slate-500 font-medium">
                          No sections added yet
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Add a section to organize your PDF files
                        </p>
                        <button
                          onClick={addSection}
                          className="mt-4 text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 justify-center mx-auto"
                        >
                          <Plus size={16} />
                          Add First Section
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t bg-white">
                  <ActionButtons
                    isAdding={!editingId}
                    onSave={saveChanges}
                    onCancel={() => {
                      // When canceling the entire form, restore original data
                      if (originalFormData) {
                        setFormData(originalFormData);
                      }
                      setIsEditing(false);
                    }}
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

export default Hospital;
