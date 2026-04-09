"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Trash2,
  FileText,
  Plus,
  X,
  Folder,
  FilePlus,
  AlertCircle,
  Calendar,
  Clock,
  GripHorizontal,
  Loader2
} from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const API_BASE = "http://localhost:4001/api/academic";

const Academic = () => {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Real State for Data
  const [academicData, setAcademicData] = useState({
    calendar: [],
    timetable: [],
  });

  const [formData, setFormData] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [activePdfUploads, setActivePdfUploads] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: null, sectionId: null, fileId: null });

  // --- FETCH DATA FROM BACKEND ---
  const fetchAcademicData = async () => {
    try {
      setIsFetching(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Transform db fields (title -> sectionTitle) to match UI
      const transformData = (items) => items.map(sec => ({
        id: sec.id,
        sectionTitle: sec.title,
        files: sec.files
      }));

      setAcademicData({
        calendar: transformData(data.calendar || []),
        timetable: transformData(data.timetable || []),
      });
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const openDrawer = (type) => {
    setActiveDrawer(type);
    setFormData(JSON.parse(JSON.stringify(academicData[type])));
    setEditingSectionId(null);
    setActivePdfUploads({});
    setFormErrors({});
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setFormData([]);
    setEditingSectionId(null);
    setActivePdfUploads({});
  };

  // --- DRAG AND DROP HANDLERS ---
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...formData];
    const draggedItem = newOrder.splice(dragItem.current, 1)[0];
    newOrder.splice(dragOverItem.current, 0, draggedItem);
    setFormData(newOrder);
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const triggerDeleteSection = (sId) => { setDeleteConfig({ type: "SECTION", sectionId: sId }); setShowConfirm(true); };
  const triggerDeleteFile = (sId, fId) => { setDeleteConfig({ type: "FILE", sectionId: sId, fileId: fId }); setShowConfirm(true); };

  const handleConfirmDelete = () => {
    const { type, sectionId, fileId } = deleteConfig;
    if (type === "SECTION") {
      setFormData((prev) => prev.filter((s) => s.id !== sectionId));
    } else if (type === "FILE") {
      setFormData((prev) => prev.map((s) => s.id === sectionId ? { ...s, files: s.files.filter((f) => f.id !== fileId) } : s));
    }
    setShowConfirm(false);
    setDeleteConfig({ type: null, sectionId: null, fileId: null });
  };

  const showPdfUpload = (sectionId, file = null) => {
    setActivePdfUploads((prev) => ({
      ...prev,
      [sectionId]: { show: true, editingFile: file, title: file ? file.name : "", selectedFile: null, isEditing: !!file },
    }));
  };

  const hidePdfUpload = (sectionId) => {
    setActivePdfUploads((prev) => { const newState = { ...prev }; delete newState[sectionId]; return newState; });
  };

  const handlePdfTitleChange = (sectionId, value) => {
    setActivePdfUploads((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], title: value } }));
  };

  const handleFileSelect = (sectionId, e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setActivePdfUploads((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], selectedFile: file, title: prev[sectionId]?.title || file.name.replace(".pdf", "") },
      }));
    } else if (file) {
      alert("Please select a PDF file only.");
      e.target.value = "";
    }
  };

  const removeSelectedFile = (sectionId) => {
    setActivePdfUploads((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], selectedFile: null } }));
  };

  // --- REAL PDF UPLOAD API CALL ---
  const handlePdfUpload = async (sectionId) => {
    const uploadData = activePdfUploads[sectionId];
    if (!uploadData) return;

    const finalTitle = uploadData.title?.trim();
    if (!finalTitle) return alert("Please enter a title for the PDF.");

    const { editingFile, selectedFile, isEditing } = uploadData;
    
    let uploadedFileName = editingFile?.fileName || "existing.pdf";
    let uploadedPdfPath = editingFile?.pdfPath || "";

    // If user selected a new file, upload it to the server
    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      try {
        const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
        const data = await res.json();
        uploadedFileName = data.fileName;
        uploadedPdfPath = data.pdfPath;
      } catch (err) {
        alert("File upload failed!");
        return;
      }
    } else if (!isEditing) {
      return alert("Please select a file");
    }

    const newFile = {
      id: isEditing ? editingFile.id : Date.now(),
      name: finalTitle,
      fileName: uploadedFileName,
      pdfPath: uploadedPdfPath,
      uploadDate: isEditing ? editingFile.uploadDate : new Date().toISOString(),
    };

    if (isEditing) {
      setFormData((prev) => prev.map((s) => s.id === sectionId ? { ...s, files: s.files.map((f) => (f.id === editingFile.id ? newFile : f)) } : s));
    } else {
      setFormData((prev) => prev.map((s) => s.id === sectionId ? { ...s, files: [...s.files, newFile] } : s));
    }
    hidePdfUpload(sectionId);
  };

  const addSection = () => {
    const newId = Date.now();
    const newSection = { id: newId, sectionTitle: "", files: [] };
    setFormData((prev) => [newSection, ...prev]);
    setEditingSectionId(newId);
  };

  const updateSectionTitle = (sId, val) => {
    setFormData((prev) => prev.map((s) => (s.id === sId ? { ...s, sectionTitle: val } : s)));
    if (formErrors[`section-${sId}`] && val.trim()) setFormErrors((prev) => ({ ...prev, [`section-${sId}`]: null }));
  };

  const handleSectionSave = () => setEditingSectionId(null);

  // --- SAVE TO BACKEND API ---
  const saveChanges = async () => {
    let hasError = false;
    const errors = {};
    formData.forEach((section, index) => {
      if (!section.sectionTitle.trim()) { errors[`section-${section.id}`] = `Section ${index + 1} title is required`; hasError = true; }
    });
    if (hasError) return setFormErrors(errors);

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeDrawer, sections: formData })
      });
      if (res.ok) {
        await fetchAcademicData(); // Refresh main dashboard data
        closeDrawer();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const PdfUploadEdit = ({ sectionId }) => {
    const uploadData = activePdfUploads[sectionId];
    const inputRef = useRef(null);
    useEffect(() => { if (uploadData?.show && inputRef.current) setTimeout(() => inputRef.current?.focus(), 10); }, [uploadData?.show]);
    if (!uploadData?.show) return null;
    const { isEditing, editingFile: currentFile } = uploadData;

    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">{isEditing ? "Edit PDF" : "Add New PDF *"}</label>
            {isEditing && currentFile && !uploadData.selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-slate-700">Current File:</span>
                <span className="text-xs text-slate-600 truncate">{currentFile.fileName}</span>
              </div>
            )}
            <input ref={inputRef} type="text" value={uploadData.title || ""} onChange={(e) => handlePdfTitleChange(sectionId, e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500" placeholder="Enter PDF title" required />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              {uploadData.selectedFile ? (
                <div className="flex-1 w-full flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg"><FileText size={20} className="text-red-500" /></div>
                    <span className="text-sm font-medium truncate max-w-[200px]">{uploadData.selectedFile.name}</span>
                  </div>
                  <button onClick={() => removeSelectedFile(sectionId)} className="p-1 text-red-500 hover:bg-red-50 rounded" type="button"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-slate-700">{isEditing ? "Choose new PDF file" : "Choose PDF File *"}</span>
                  <input type="file" accept=".pdf" hidden onChange={(e) => handleFileSelect(sectionId, e)} required />
                </label>
              )}
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => handlePdfUpload(sectionId)} disabled={!uploadData.title?.trim() && !isEditing} className={`px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${uploadData.title?.trim() || isEditing ? "bg-blue-400/30 text-blue-950 cursor-pointer hover:bg-blue-400/40" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`} type="button">{isEditing ? "Update" : "Upload"}</button>
                <button onClick={() => hidePdfUpload(sectionId)} className="px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors w-full md:w-auto" type="button">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isFetching) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your academic content and schedules</p>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Calendar size={24} /></div>
              <div><h3 className="text-lg font-bold text-slate-800">Academic Calendar</h3><p className="text-sm text-slate-500 mt-1">Manage yearly academic calendars</p></div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button onClick={() => openDrawer("calendar")} className="text-orange-500 font-medium text-sm hover:text-orange-600 transition-colors">Manage calendar</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock size={24} /></div>
              <div><h3 className="text-lg font-bold text-slate-800">Time Table</h3><p className="text-sm text-slate-500 mt-1">Manage class and exam time tables</p></div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button onClick={() => openDrawer("timetable")} className="text-orange-500 font-medium text-sm hover:text-orange-600 transition-colors">Manage time tables</button>
            </div>
          </div>
        </div>

        {/* SLIDING DRAWER */}
        <AnimatePresence>
          {activeDrawer && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
                
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      {activeDrawer === "calendar" ? <Calendar size={20} /> : <Clock size={20} />}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">Manage {activeDrawer === "calendar" ? "Academic Calendar" : "Time Table"}</h2>
                  </div>
                  <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><X size={20} /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8 bg-slate-50/50">
                  <div className="space-y-6 pb-10">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2"><Folder size={18} className="text-blue-500" /> Categories / Sections</h4>
                      <button onClick={addSection} className="bg-white border border-blue-200 text-blue-600 shadow-sm text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"><Plus size={16} /> Add Section</button>
                    </div>

                    {formData.length === 0 && (
                      <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-500 mb-2">No sections added yet.</p>
                        <button onClick={addSection} className="text-blue-600 font-medium hover:underline">Create your first section</button>
                      </div>
                    )}

                    {formData.map((section, index) => (
                      <div 
                        key={section.id} 
                        // DRAG AND DROP ADDED HERE
                        draggable
                        onDragStart={() => (dragItem.current = index)}
                        onDragEnter={() => (dragOverItem.current = index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`relative pl-10 p-6 rounded-3xl border transition-all cursor-grab active:cursor-grabbing ${editingSectionId === section.id ? "bg-white border-blue-300 shadow-md ring-4 ring-blue-50" : "bg-white shadow-sm border-slate-200 hover:border-blue-200"}`}
                      >
                        {/* Drag Handle Icon */}
                        <div className="absolute left-3 top-[30px] text-slate-300 hover:text-slate-500">
                           <GripHorizontal size={20} />
                        </div>

                        <div className="flex justify-between items-center mb-6 group/sec">
                          <div className="flex-1">
                            {editingSectionId === section.id ? (
                              <div className="space-y-2">
                                <input autoFocus className={`bg-slate-50 mr-2 px-3 py-2 rounded-xl border text-lg font-medium text-slate-800 outline-none w-full focus:bg-white focus:ring-2 focus:ring-blue-100 ${formErrors[`section-${section.id}`] ? "border-red-400" : "border-slate-300 focus:border-blue-400"}`} value={section.sectionTitle} onChange={(e) => updateSectionTitle(section.id, e.target.value)} placeholder="e.g. BAMS 1st Year Timetable" />
                                {formErrors[`section-${section.id}`] && <div className="flex items-center gap-1 text-red-500 text-xs ml-2"><AlertCircle size={12} /><span>Required</span></div>}
                              </div>
                            ) : (
                              <h5 className="text-lg font-semibold text-slate-800">{section.sectionTitle || "Untitled Section"}</h5>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {editingSectionId === section.id ? (
                              <button onClick={handleSectionSave} className="px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm">Done</button>
                            ) : (
                              <button onClick={() => setEditingSectionId(section.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"><Pencil size={16} /></button>
                            )}
                            <button onClick={() => triggerDeleteSection(section.id)} className="p-2 text-red-500 hover:bg-red-100 bg-slate-100 rounded-full transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {/* Files List */}
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 cursor-default">
                          {section.files.map((file) => (
                            <div key={file.id} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 items-center shadow-sm">
                              <div className="p-2 bg-red-50 rounded-lg"><FileText size={24} className="text-red-500" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">File: {file.fileName} • {formatDate(file.uploadDate)}</p>
                              </div>
                              <div className="flex gap-1.5 opacity-0 group-hover/sec:opacity-100 transition-opacity md:opacity-100">
                                <button onClick={() => showPdfUpload(section.id, file)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                                <button onClick={() => triggerDeleteFile(section.id, file.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}

                          <PdfUploadEdit sectionId={section.id} />
                          
                          {section.files.length === 0 && !activePdfUploads[section.id]?.show && <div className="text-center py-4 text-slate-400 text-sm">No PDFs uploaded yet.</div>}
                          {editingSectionId === section.id && !activePdfUploads[section.id]?.show && (
                            <div className="mt-4 pt-2">
                              <button onClick={() => showPdfUpload(section.id)} className="w-full p-3 bg-white rounded-xl border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <FilePlus size={18} /> <span className="text-sm font-medium">Add PDF File</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t bg-white z-20 flex justify-end gap-3">
                  <button onClick={closeDrawer} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                  <button onClick={saveChanges} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
                    {isSaving && <Loader2 size={16} className="animate-spin" />} Save Updates
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteModal show={showConfirm} onConfirm={handleConfirmDelete} onCancel={() => setShowConfirm(false)} />
    </div>
  );
};

export default Academic;