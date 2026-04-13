"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Trash2,
  FileText,
  Plus,
  X,
  FilePlus,
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

  // Data structure is now just arrays of files
  const [academicData, setAcademicData] = useState({
    calendar: [],
    timetable: [],
  });

  const [formData, setFormData] = useState([]); // Array of files for the active drawer
  
  // Single Upload Form State
  const [uploadState, setUploadState] = useState({
    show: false,
    isEditing: false,
    editingId: null,
    title: "",
    selectedFile: null,
    currentFileName: ""
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // --- FETCH DATA FROM BACKEND ---
  const fetchAcademicData = async () => {
    try {
      setIsFetching(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      setAcademicData({
        calendar: data.calendar || [],
        timetable: data.timetable || [],
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
    resetUploadState();
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setFormData([]);
    resetUploadState();
  };

  const resetUploadState = () => {
    setUploadState({ show: false, isEditing: false, editingId: null, title: "", selectedFile: null, currentFileName: "" });
  };

  // --- DRAG AND DROP HANDLERS FOR FILES ---
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

  // --- DELETE HANDLERS ---
  const triggerDeleteFile = (fId) => {
    setFileToDelete(fId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setFormData((prev) => prev.filter((f) => f.id !== fileToDelete));
    setShowConfirm(false);
    setFileToDelete(null);
  };

  // --- PDF UPLOAD HANDLERS ---
  const openAddForm = () => {
    setUploadState({ show: true, isEditing: false, editingId: null, title: "", selectedFile: null, currentFileName: "" });
  };

  const openEditForm = (file) => {
    setUploadState({ show: true, isEditing: true, editingId: file.id, title: file.name, selectedFile: null, currentFileName: file.fileName });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadState((prev) => ({
        ...prev,
        selectedFile: file,
        title: prev.title || file.name.replace(".pdf", ""),
      }));
    } else if (file) {
      alert("Please select a PDF file only.");
      e.target.value = "";
    }
  };

  const removeSelectedFile = () => {
    setUploadState((prev) => ({ ...prev, selectedFile: null }));
  };

  // --- REAL PDF UPLOAD API CALL ---
  const handlePdfUpload = async () => {
    const finalTitle = uploadState.title?.trim();
    if (!finalTitle) return alert("Please enter a title for the PDF.");

    const { isEditing, editingId, selectedFile, currentFileName } = uploadState;
    const existingFile = isEditing ? formData.find(f => f.id === editingId) : null;
    
    let uploadedFileName = currentFileName || "existing.pdf";
    let uploadedPdfPath = existingFile?.pdfPath || "";

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
      return alert("Please select a file to upload.");
    }

    const newFile = {
      id: isEditing ? editingId : Date.now(),
      name: finalTitle,
      fileName: uploadedFileName,
      pdfPath: uploadedPdfPath,
      uploadDate: isEditing ? existingFile.uploadDate : new Date().toISOString(),
    };

    if (isEditing) {
      setFormData((prev) => prev.map((f) => f.id === editingId ? newFile : f));
    } else {
      // Add new file to the top of the list
      setFormData((prev) => [newFile, ...prev]);
    }
    resetUploadState();
  };

  // --- SAVE TO BACKEND API ---
  const saveChanges = async () => {
    try {
      setIsSaving(true);
      // Payload changed to send files array directly
      const res = await fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeDrawer, files: formData })
      });
      if (res.ok) {
        await fetchAcademicData();
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

  // --- COMPONENT: UPLOAD FORM ---
  const PdfUploadForm = () => {
    if (!uploadState.show) return null;
    const { isEditing, currentFileName, title, selectedFile } = uploadState;

    return (
      <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-md mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-800 mb-2 block">
              {isEditing ? "Edit Document" : "Add New Document"}
            </label>
            
            {isEditing && currentFileName && !selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-slate-700">Current File:</span>
                <span className="text-xs text-slate-600 truncate">{currentFileName}</span>
              </div>
            )}
            
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setUploadState(prev => ({ ...prev, title: e.target.value }))} 
              className="w-full p-3 border border-slate-300 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium" 
              placeholder="e.g. BAMS 1st Year Timetable 2025" 
              required 
            />
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              {selectedFile ? (
                <div className="flex-1 w-full flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg"><FileText size={20} className="text-red-600" /></div>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={removeSelectedFile} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" type="button"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors group">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">{isEditing ? "Choose a new PDF (Optional)" : "Click to select PDF File *"}</span>
                  <input type="file" accept=".pdf" hidden onChange={handleFileSelect} />
                </label>
              )}
              
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handlePdfUpload} disabled={!title.trim() && !isEditing} className={`px-6 py-3 rounded-xl font-semibold transition-colors w-full md:w-auto ${title.trim() || isEditing ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`} type="button">
                  {isEditing ? "Update" : "Upload"}
                </button>
                <button onClick={resetUploadState} className="px-6 py-3 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors w-full md:w-auto" type="button">
                  Cancel
                </button>
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
          <p className="text-slate-500 mt-1">Manage your academic content and schedules directly</p>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group" onClick={() => openDrawer("calendar")}>
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-50 group-hover:bg-blue-100 p-4 rounded-2xl text-blue-600 transition-colors"><Calendar size={28} /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Calendar</h3>
                <p className="text-sm text-slate-500 mt-1">Manage yearly academic calendars and holiday lists.</p>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <span className="text-orange-500 font-semibold text-sm group-hover:text-orange-600 transition-colors">Open Calendars &rarr;</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group" onClick={() => openDrawer("timetable")}>
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-50 group-hover:bg-blue-100 p-4 rounded-2xl text-blue-600 transition-colors"><Clock size={28} /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Time Tables</h3>
                <p className="text-sm text-slate-500 mt-1">Manage class schedules and exam time tables directly.</p>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <span className="text-orange-500 font-semibold text-sm group-hover:text-orange-600 transition-colors">Open Time Tables &rarr;</span>
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
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      {activeDrawer === "calendar" ? <Calendar size={22} /> : <Clock size={22} />}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {activeDrawer === "calendar" ? "Academic Calendars" : "Time Tables"}
                    </h2>
                  </div>
                  <button onClick={closeDrawer} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"><X size={20} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
                  
                  {/* Action Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">Uploaded Documents</h4>
                    {!uploadState.show && (
                      <button onClick={openAddForm} className="bg-white border border-blue-200 text-blue-600 shadow-sm text-sm font-bold flex items-center gap-2 hover:bg-blue-50 px-5 py-2.5 rounded-xl transition-colors">
                        <FilePlus size={18} /> Upload PDF
                      </button>
                    )}
                  </div>

                  {/* Upload Form Block */}
                  <PdfUploadForm />

                  {/* List of Files (Draggable) */}
                  {formData.length === 0 && !uploadState.show && (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="text-slate-400" size={32}/></div>
                      <p className="text-slate-600 font-medium mb-1">No documents uploaded yet.</p>
                      <p className="text-slate-400 text-sm mb-4">Upload your first PDF to see it here.</p>
                      <button onClick={openAddForm} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Click here to Upload</button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {formData.map((file, index) => (
                      <div 
                        key={file.id} 
                        draggable
                        onDragStart={() => (dragItem.current = index)}
                        onDragEnter={() => (dragOverItem.current = index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className="group relative flex gap-4 bg-white p-4 pl-12 rounded-2xl border border-slate-200 items-center shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                      >
                        {/* Drag Handle Icon */}
                        <div className="absolute left-4 text-slate-300 group-hover:text-slate-500">
                           <GripHorizontal size={20} />
                        </div>

                        <div className="p-3 bg-red-50 rounded-xl"><FileText size={24} className="text-red-500" /></div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            <span className="truncate max-w-[150px] md:max-w-[250px] inline-block">{file.fileName}</span> 
                            <span>•</span> 
                            <span>{formatDate(file.uploadDate)}</span>
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button onClick={() => openEditForm(file)} className="p-2.5 bg-slate-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit"><Pencil size={16} /></button>
                          <button onClick={() => triggerDeleteFile(file.id)} className="p-2.5 bg-slate-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t bg-white z-20 flex justify-end gap-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                  <button onClick={closeDrawer} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                  <button onClick={saveChanges} disabled={isSaving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
                    {isSaving && <Loader2 size={18} className="animate-spin" />} Save Updates
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