"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Folder,
  FileText,
  Video,
  Youtube,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const Departments = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({
    type: null,
    tabId: null,
    sectionId: null,
    photoId: null,
    videoId: null,
    pdfId: null,
  });
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [formData, setFormData] = useState({ title: "", section: null });

  // PDF upload states
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [editingPdfId, setEditingPdfId] = useState(null);
  const [showPdfUpload, setShowPdfUpload] = useState(false);

  // Video link states
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // PDF title inline editing state
  const [editingPdfTitleId, setEditingPdfTitleId] = useState(null);
  const [editingPdfTitleValue, setEditingPdfTitleValue] = useState("");

  // Video title inline editing state
  const [editingVideoTitleId, setEditingVideoTitleId] = useState(null);
  const [editingVideoTitleValue, setEditingVideoTitleValue] = useState("");
  const [editingVideoLinkValue, setEditingVideoLinkValue] = useState("");

  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false);

  // Warning state for tab deletion
  const [tabDeleteWarning, setTabDeleteWarning] = useState({
    show: false,
    tabId: null,
  });

  // Track if we're editing an existing tab
  const [isEditingExistingTab, setIsEditingExistingTab] = useState(false);

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();

      const transformed = data.map(dep => ({
        id: dep.id,
        title: dep.name, // map name → title
        section: {
          id: dep.details?.id || Date.now(),
          description: dep.details?.description || "",
          pdfs: (dep.pdfs || []).map(p => ({
            id: p.id,
            title: p.title,
            fileName: p.fileName,
            url: p.fileUrl,          // map fileUrl
            fileSize: p.fileSize,
            uploadDate: p.uploadDate
          })),
          photos: (dep.photos || []).map(ph => ({
            id: ph.id,
            fileName: ph.fileName,
            url: ph.photoUrl         // map photoUrl
          })),
          videos: (dep.videos || []).map(v => ({
            id: v.id,
            title: v.title,
            url: v.videoUrl          // map videoUrl
          }))
        }
      }));

      setTabs(transformed);

    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- VALIDATION FUNCTION ---
  const validateForm = () => {
    const errors = {};
    if (!formData.title?.trim()) {
      errors.title = "Tab title is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- DELETE HANDLERS ---
  const triggerDeleteTab = (id) => {
    const tab = tabs.find((t) => t.id === id);
    const hasContent =
      tab?.section &&
      ((tab.section.pdfs && tab.section.pdfs.length > 0) ||
        (tab.section.photos && tab.section.photos.length > 0) ||
        (tab.section.videos && tab.section.videos.length > 0));

    if (hasContent) {
      setTabDeleteWarning({ show: true, tabId: id });
      return;
    }
    setDeleteConfig({ type: "TAB", tabId: id });
    setShowConfirm(true);
  };

  const triggerDeletePhoto = (pId) => {
    setDeleteConfig({ type: "PHOTO", photoId: pId });
    setShowConfirm(true);
  };
  const triggerDeleteVideo = (vId) => {
    setDeleteConfig({ type: "VIDEO", videoId: vId });
    setShowConfirm(true);
  };
  const triggerDeletePdf = (pId) => {
    setDeleteConfig({ type: "PDF", pdfId: pId });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { type, tabId, photoId, videoId, pdfId } = deleteConfig;

    if (type === "TAB") {
      try {
        await fetch(`/api/departments/${tabId}`, {
          method: "DELETE",
        });
        await fetchDepartments();
      } catch (err) {
        console.error(err);
      }
      if (tabDeleteWarning.tabId === tabId)
        setTabDeleteWarning({ show: false, tabId: null });
    } else if (type === "PHOTO") {
      setFormData((prev) => ({
        ...prev,
        section: {
          ...prev.section,
          photos: prev.section.photos.filter((p) => p.id !== photoId),
        },
      }));
      setHasChanges(true);
    } else if (type === "VIDEO") {
      setFormData((prev) => ({
        ...prev,
        section: {
          ...prev.section,
          videos: prev.section.videos.filter((v) => v.id !== videoId),
        },
      }));
      setHasChanges(true);
    } else if (type === "PDF") {
      setFormData((prev) => ({
        ...prev,
        section: {
          ...prev.section,
          pdfs: prev.section.pdfs.filter((p) => p.id !== pdfId),
        },
      }));
      setHasChanges(true);
    }

    setShowConfirm(false);
    setDeleteConfig({
      type: null,
      tabId: null,
      photoId: null,
      videoId: null,
      pdfId: null,
    });
  };

  const handleCloseTabWarning = () =>
    setTabDeleteWarning({ show: false, tabId: null });

  // --- EDITING LOGIC ---
  const startEditing = (tab) => {
    setEditingId(tab.id);
    setFormData(JSON.parse(JSON.stringify(tab)));
    setIsEditing(true);
    setIsEditingExistingTab(true);
    setEditingSectionId(tab.section?.id || null);
    setValidationErrors({});
    resetForms();
    setHasChanges(false);
    setTabDeleteWarning({ show: false, tabId: null });
  };

  const startAddingTab = () => {
    setEditingId(null);
    setFormData({
      title: "",
      section: {
        id: Date.now(),
        description: "",
        pdfs: [],
        photos: [],
        videos: [],
      },
    });
    setIsEditing(true);
    setIsEditingExistingTab(false);
    setEditingSectionId(Date.now());
    setValidationErrors({});
    resetForms();
    setHasChanges(true);
    setTabDeleteWarning({ show: false, tabId: null });
  };

  const updateSectionData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      section: { ...prev.section, [field]: value },
    }));
    setHasChanges(true);
  };

  const resetForms = () => {
    setPdfTitle("");
    setPdfFile(null);
    setEditingPdfId(null);
    setShowPdfUpload(false);
    setVideoLink("");
    setVideoTitle("");
    setEditingVideoId(null);
    setShowVideoUpload(false);
    setEditingPdfTitleId(null);
    setEditingPdfTitleValue("");
    setEditingVideoTitleId(null);
    setEditingVideoTitleValue("");
    setEditingVideoLinkValue("");
  };

  // --- PDF HANDLERS ---
  const handlePdfFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      if (!pdfTitle.trim()) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setPdfTitle(fileNameWithoutExt);
      }
      setHasChanges(true);
    } else {
      alert("Please select a valid PDF file.");
    }
    e.target.value = "";
  };

  const handlePdfUpload = () => {
    if (!editingPdfId && !pdfFile) {
      alert("Please select a PDF file.");
      return;
    }
    if (!pdfTitle.trim()) {
      alert("Please enter a PDF title.");
      return;
    }

    const currentDate = new Date().toISOString();
    const fileSizeMB = pdfFile
      ? (pdfFile.size / (1024 * 1024)).toFixed(2)
      : "0";
    const tempId = pdfFile ? `pdf_${Date.now()}_${Math.random()}` : null;
    const existingPdf = editingPdfId
      ? formData.section.pdfs.find((p) => p.id === editingPdfId)
      : null;

    const pdfData = {
      id: editingPdfId || Date.now(),
      url:
        editingPdfId && !pdfFile && existingPdf
          ? existingPdf.url
          : pdfFile
            ? URL.createObjectURL(pdfFile)
            : "#",
      fileName:
        editingPdfId && !pdfFile && existingPdf
          ? existingPdf.fileName
          : pdfFile
            ? pdfFile.name
            : "document.pdf",
      title: pdfTitle.trim(),
      uploadDate: existingPdf ? existingPdf.uploadDate : currentDate,
      fileSize:
        existingPdf && !pdfFile ? existingPdf.fileSize : `${fileSizeMB} MB`,
      rawFile: pdfFile,
      tempId: tempId,
    };

    setFormData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        pdfs: editingPdfId
          ? prev.section.pdfs.map((p) => (p.id === editingPdfId ? pdfData : p))
          : [...prev.section.pdfs, pdfData],
      },
    }));

    setPdfTitle("");
    setPdfFile(null);
    setEditingPdfId(null);
    setShowPdfUpload(false);
    setHasChanges(true);
  };

  // --- PHOTO HANDLER ---
  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      id: Math.random() + Date.now(),
      url: URL.createObjectURL(file),
      fileName: file.name,
      rawFile: file,
      tempId: `img_${Date.now()}_${Math.random()}`,
    }));

    setFormData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        photos: [...prev.section.photos, ...newPhotos],
      },
    }));
    setHasChanges(true);
    e.target.value = "";
  };

  // --- SAVE CHANGES (POST TO BACKEND) ---
  const saveChanges = async () => {
    if (!validateForm()) return;

    const submitData = new FormData();

    // Prepare JSON (remove circular refs like rawFile)
    const cleanData = {
      id: editingId && String(editingId).length < 10 ? editingId : null,
      title: formData.title,
      section: {
        description: formData.section.description,
        pdfs: formData.section.pdfs.map((p) => ({
          title: p.title,
          fileName: p.fileName,
          fileSize: p.fileSize,
          url: p.url,
          tempId: p.tempId,
        })),
        photos: formData.section.photos.map((p) => ({
          fileName: p.fileName,
          url: p.url,
          tempId: p.tempId,
        })),
        videos: formData.section.videos.map((v) => ({
          title: v.title,
          url: v.url,
        })),
      },
    };

    submitData.append("departmentData", JSON.stringify(cleanData));

    // Append files
    formData.section.pdfs.forEach((p) => {
      if (p.rawFile && p.tempId) submitData.append(p.tempId, p.rawFile);
    });
    formData.section.photos.forEach((p) => {
      if (p.rawFile && p.tempId) submitData.append(p.tempId, p.rawFile);
    });

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        await fetchDepartments();
        setIsEditing(false);
        setValidationErrors({});
        resetForms();
        setHasChanges(false);
      } else {
        alert("Failed to save data");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // --- UTILS ---
  const getPdfDisplayTitle = (pdf) =>
    pdf.title?.trim() || pdf.fileName.replace(/\.[^/.]+$/, "");
  const isYouTubeUrl = (url) =>
    url.includes("youtube.com") || url.includes("youtu.be");
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setPdfFile(files[0]);
      if (!pdfTitle.trim()) setPdfTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      setHasChanges(true);
    } else {
      alert("Please drop a PDF file only.");
    }
  };

  // --- ADDITIONAL HELPERS FOR EDITING ---
  const startEditingPdfTitle = (pdf) => {
    setEditingPdfTitleId(pdf.id);
    setEditingPdfTitleValue(pdf.title || pdf.fileName);
  };
  const cancelPdfTitleEdit = () => {
    setEditingPdfTitleId(null);
    setEditingPdfTitleValue("");
  };
  const savePdfTitle = (pdfId) => {
    if (!editingPdfTitleValue.trim()) return alert("Title empty");
    setFormData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        pdfs: prev.section.pdfs.map((p) =>
          p.id === pdfId ? { ...p, title: editingPdfTitleValue } : p,
        ),
      },
    }));
    setEditingPdfTitleId(null);
    setHasChanges(true);
  };
  const startEditingPdf = (pdf) => {
    setEditingPdfId(pdf.id);
    setPdfTitle(pdf.title);
    setPdfFile(null);
    setShowPdfUpload(true);
  };
  const cancelPdfEdit = () => {
    setEditingPdfId(null);
    setPdfTitle("");
    setPdfFile(null);
    setShowPdfUpload(false);
  };
  const showPdfUploadForm = () => {
    setShowPdfUpload(true);
    setEditingPdfId(null);
    setPdfTitle("");
    setPdfFile(null);
  };

  const addVideoLink = () => {
    if (!videoTitle.trim() || !videoLink.trim()) return alert("Enter details");
    const newVideo = {
      id: editingVideoId || Date.now(),
      url: videoLink.trim(),
      title: videoTitle.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        videos: editingVideoId
          ? prev.section.videos.map((v) =>
            v.id === editingVideoId ? newVideo : v,
          )
          : [...prev.section.videos, newVideo],
      },
    }));
    setVideoLink("");
    setVideoTitle("");
    setEditingVideoId(null);
    setShowVideoUpload(false);
    setHasChanges(true);
  };
  const startEditingVideo = (video) => {
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setVideoLink(video.url);
    setShowVideoUpload(true);
  };
  const cancelVideoEdit = () => {
    setEditingVideoId(null);
    setVideoLink("");
    setVideoTitle("");
    setShowVideoUpload(false);
  };
  const showVideoUploadForm = () => {
    setShowVideoUpload(true);
    setEditingVideoId(null);
    setVideoLink("");
    setVideoTitle("");
  };
  const startEditingVideoInline = (video) => {
    setEditingVideoTitleId(video.id);
    setEditingVideoTitleValue(video.title);
    setEditingVideoLinkValue(video.url);
  };
  const cancelVideoInlineEdit = () => {
    setEditingVideoTitleId(null);
    setEditingVideoTitleValue("");
    setEditingVideoLinkValue("");
  };
  const saveVideoInline = (videoId) => {
    if (!editingVideoTitleValue.trim() || !editingVideoLinkValue.trim())
      return alert("Fields empty");
    setFormData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        videos: prev.section.videos.map((v) =>
          v.id === videoId
            ? {
              ...v,
              title: editingVideoTitleValue,
              url: editingVideoLinkValue,
            }
            : v,
        ),
      },
    }));
    setEditingVideoTitleId(null);
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Departments
          </h1>
          <button
            onClick={startAddingTab}
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading departments...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`relative bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow ${tabDeleteWarning.show && tabDeleteWarning.tabId === tab.id ? "border-red-300" : "border-slate-200"}`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800">
                        {tab.title}
                      </h3>
                    </div>
                    {tabDeleteWarning.show &&
                      tabDeleteWarning.tabId === tab.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mx-4 flex-1 max-w-4xl"
                        >
                          <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <div className="bg-red-100 p-1 rounded">
                              <AlertCircle size={14} className="text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-800">
                                Cannot Delete Tab
                              </p>
                              <p className="text-xs text-red-700">
                                Delete all content first
                              </p>
                            </div>
                            <button
                              onClick={handleCloseTabWarning}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <X size={14} />
                            </button>
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
                    {editingId ? "Update Departments" : "Add Departments"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[12px] font-semibold text-slate-800 ">
                        Tab Title *
                      </label>
                      {validationErrors.title && (
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                          {validationErrors.title}
                        </span>
                      )}
                    </div>
                    <input
                      className={`w-full text-lg font-normal border-2 p-2 rounded-xl focus:outline-none pb-2 transition-all ${validationErrors.title ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (validationErrors.title)
                          setValidationErrors({
                            ...validationErrors,
                            title: "",
                          });
                        setHasChanges(true);
                      }}
                      placeholder="Enter tab title"
                      required
                    />
                  </div>

                  <div className="space-y-6 pb-10">
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Folder size={18} className="text-blue-500" /> Section
                        Content
                      </h4>
                    </div>
                    {formData.section && (
                      <div
                        className={`relative p-6 rounded-3xl border transition-all ${editingSectionId === formData.section.id ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="mb-6">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-4">
                            <FileText size={18} className="text-red-500" />{" "}
                            Description
                          </label>
                          {editingSectionId === formData.section.id ? (
                            <textarea
                              className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 min-h-[120px] resize-none"
                              placeholder="Enter details about this section..."
                              value={formData.section.description}
                              onChange={(e) =>
                                updateSectionData("description", e.target.value)
                              }
                            />
                          ) : (
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 pl-6">
                              {formData.section.description ||
                                "No description provided."}
                            </p>
                          )}
                        </div>

                        {/* PDFs Section */}
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <FileText size={18} className="text-red-500" />{" "}
                              PDF Documents
                            </label>
                            {formData.section.pdfs?.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {formData.section.pdfs.length} docs
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 mb-4">
                            {formData.section.pdfs?.map((pdf) => (
                              <div
                                key={pdf.id}
                                className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-100 items-center shadow-sm"
                              >
                                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                  <FileText
                                    size={24}
                                    className="text-red-500"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {editingSectionId === formData.section.id &&
                                    editingPdfTitleId === pdf.id ? (
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        value={editingPdfTitleValue}
                                        onChange={(e) =>
                                          setEditingPdfTitleValue(
                                            e.target.value,
                                          )
                                        }
                                        className="w-full p-2 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500"
                                        autoFocus
                                      />
                                      <div className="flex gap-2 mt-1">
                                        <button
                                          onClick={() => savePdfTitle(pdf.id)}
                                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelPdfTitleEdit}
                                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="group relative">
                                      <p className="text-sm font-medium text-slate-700 truncate">
                                        {getPdfDisplayTitle(pdf)}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[9px] text-slate-500">
                                      Uploaded: {formatDate(pdf.uploadDate)}
                                    </span>
                                  </div>
                                </div>
                                {editingSectionId === formData.section.id &&
                                  editingPdfTitleId !== pdf.id && (
                                    <div className="flex gap-2 flex-shrink-0">
                                      <button
                                        onClick={() => startEditingPdf(pdf)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                      <button
                                        onClick={() => triggerDeletePdf(pdf.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                          {editingSectionId === formData.section.id &&
                            showPdfUpload && (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-xs font-medium text-slate-700 mb-1 block">
                                      {editingPdfId
                                        ? "Edit PDF"
                                        : "Add New PDF *"}
                                    </label>
                                    {editingPdfId && !pdfFile && (
                                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText
                                            size={16}
                                            className="text-blue-500"
                                          />
                                          <span className="text-xs text-slate-600 truncate">
                                            {formData.section.pdfs.find(
                                              (p) => p.id === editingPdfId,
                                            )?.fileName || "document.pdf"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <input
                                      type="text"
                                      value={pdfTitle}
                                      onChange={(e) => {
                                        setPdfTitle(e.target.value);
                                        setHasChanges(true);
                                      }}
                                      className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-3"
                                      placeholder="Enter PDF title"
                                      required
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
                                        <label
                                          className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                                          onDragOver={handleDragOver}
                                          onDrop={handleDrop}
                                        >
                                          <span className="text-sm font-medium text-slate-700">
                                            {editingPdfId
                                              ? "Choose new PDF file "
                                              : "Choose PDF File *"}
                                          </span>
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            hidden
                                            onChange={handlePdfFileSelect}
                                            required={!editingPdfId}
                                          />
                                        </label>
                                      )}
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handlePdfUpload}
                                          disabled={
                                            !pdfTitle.trim() ||
                                            (!editingPdfId && !pdfFile)
                                          }
                                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${pdfTitle.trim() && (editingPdfId || pdfFile) ? "bg-blue-400/30 text-blue-950 cursor-pointer" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
                                          type="button"
                                        >
                                          {editingPdfId ? "Update" : "Upload"}
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
                                  </div>
                                </div>
                              </div>
                            )}
                          {editingSectionId === formData.section.id &&
                            !showPdfUpload && (
                              <div className="mt-4">
                                <button
                                  onClick={showPdfUploadForm}
                                  className="w-full p-3 bg-white rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Plus size={18} />
                                  <span className="text-sm font-medium">
                                    {formData.section.pdfs.length === 0
                                      ? "Add First PDF"
                                      : "Add Another PDF"}
                                  </span>
                                </button>
                              </div>
                            )}
                        </div>

                        {/* Photos Section */}
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <ImageIcon
                                size={18}
                                className="text-purple-500"
                              />{" "}
                              Photo Gallery
                            </label>
                            {formData.section.photos?.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {formData.section.photos.length} Photos
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                            {formData.section.photos?.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group/img shadow-sm"
                              >
                                <img
                                  src={  `${photo.url}`}
                                  alt="upload preview"
                                  className="w-full h-full object-cover"
                                />
                                {editingSectionId === formData.section.id && (
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all">
                                    <button
                                      onClick={() =>
                                        triggerDeletePhoto(photo.id)
                                      }
                                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full transition-all shadow-lg hover:scale-110"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            {editingSectionId === formData.section.id && (
                              <label className="aspect-square rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group/add">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-2 group-hover/add:scale-110 transition-transform">
                                  <Plus size={24} />
                                </div>
                                <p className="text-sm font-medium text-blue-700">
                                  Add Photos
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  hidden
                                  onChange={handleMultipleImageUpload}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Videos Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Video size={18} className="text-red-500" /> Video
                              Links
                            </label>
                            {formData.section.videos?.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {formData.section.videos.length} Videos
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 mb-4">
                            {formData.section.videos?.map((video) => (
                              <div
                                key={video.id}
                                className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div
                                    className={`p-3 rounded-xl flex-shrink-0 ${isYouTubeUrl(video.url) ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                                  >
                                    {isYouTubeUrl(video.url) ? (
                                      <Youtube size={22} />
                                    ) : (
                                      <Video size={22} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    {editingSectionId === formData.section.id &&
                                      editingVideoTitleId === video.id ? (
                                      <div className="space-y-2 mb-2">
                                        <input
                                          type="text"
                                          value={editingVideoTitleValue}
                                          onChange={(e) =>
                                            setEditingVideoTitleValue(
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-2 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500"
                                          placeholder="Enter video title"
                                          autoFocus
                                        />
                                        <input
                                          type="text"
                                          value={editingVideoLinkValue}
                                          onChange={(e) =>
                                            setEditingVideoLinkValue(
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-2 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500"
                                          placeholder="Enter video URL"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              saveVideoInline(video.id)
                                            }
                                            className="text-xs bg-blue-400/30 text-blue-950 px-2 py-1 rounded transition-colors"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelVideoInlineEdit}
                                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="group relative">
                                          <p className="font-medium text-sm text-slate-800 truncate">
                                            {video.title || "Untitled Video"}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <p className="text-xs text-slate-500 truncate">
                                            {video.url}
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingSectionId === formData.section.id &&
                                  editingVideoTitleId !== video.id && (
                                    <div className="flex gap-2 flex-shrink-0">
                                      <button
                                        onClick={() => startEditingVideo(video)}
                                        className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-3xl transition-colors"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          triggerDeleteVideo(video.id)
                                        }
                                        className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-3xl transition-colors"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                          {editingSectionId === formData.section.id &&
                            showVideoUpload && (
                              <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-3">
                                      <label className="text-sm font-semibold text-slate-800">
                                        {editingVideoId
                                          ? `Edit Video`
                                          : "Add New Video"}
                                      </label>
                                      <button
                                        onClick={cancelVideoEdit}
                                        className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                                        type="button"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                    <div className="mb-4">
                                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                                        Video Title{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) => {
                                          setVideoTitle(e.target.value);
                                          setHasChanges(true);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter video title"
                                        required
                                      />
                                    </div>
                                    <div className="mb-4">
                                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                                        Video Link (URL){" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={videoLink}
                                        onChange={(e) => {
                                          setVideoLink(e.target.value);
                                          setHasChanges(true);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="https://example.com/video"
                                        required
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={addVideoLink}
                                        disabled={
                                          !videoTitle.trim() ||
                                          !videoLink.trim()
                                        }
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${videoTitle.trim() && videoLink.trim() ? "bg-blue-400/30 text-blue-950" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
                                        type="button"
                                      >
                                        {editingVideoId
                                          ? "Save Changes"
                                          : "Add Video"}
                                      </button>
                                      <button
                                        onClick={cancelVideoEdit}
                                        className="px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                                        type="button"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          {editingSectionId === formData.section.id &&
                            !showVideoUpload && (
                              <div className="mt-4">
                                <button
                                  onClick={showVideoUploadForm}
                                  className="w-full p-3 bg-white rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Video size={18} />
                                  <span className="text-sm font-medium">
                                    {formData.section.videos.length === 0
                                      ? "Add First Video"
                                      : "Add Another Video"}
                                  </span>
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t bg-white">
                  <ActionButtons
                    isAdding={!editingId}
                    onSave={saveChanges}
                    onCancel={() => setIsEditing(false)}
                    isSaveDisabled={!hasChanges}
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

export default Departments;
