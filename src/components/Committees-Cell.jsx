"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, FileText, Plus, X, AlertCircle } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const CommitteesCell = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Input States
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // New file upload
  const [currentFileName, setCurrentFileName] = useState(""); // Existing file name
  
  // UI States
  const [errors, setErrors] = useState({});
  const [deleteConfig, setDeleteConfig] = useState({ type: null, tabId: null });
  const [tabDeleteWarning, setTabDeleteWarning] = useState({ show: false, tabId: null });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/committees");
      const data = await res.json();

      // Transform DB data to match your UI structure
      const formattedTabs = data.map((item) => ({
        id: item.id,
        title: item.title,
        pdfFile: item.pdf_path
          ? {
              id: item.id,
              name: item.pdf_name,
              uploadedDate: item.uploaded_date,
              url: item.pdf_path,
            }
          : null,
      }));

      setTabs(formattedTabs);
    } catch (error) {
      console.error("Error loading committees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  // --- HANDLERS ---

  const startAddingTab = () => {
    setEditingId(null);
    setTitle("");
    setPdfFile(null);
    setCurrentFileName("");
    setErrors({});
    setIsEditing(true);
  };

  const startEditing = (tab) => {
    setEditingId(tab.id);
    setTitle(tab.title);
    setPdfFile(null);
    
    if (tab.pdfFile) {
      setCurrentFileName(tab.pdfFile.name);
    } else {
      setCurrentFileName("");
    }
    
    setErrors({});
    setIsEditing(true);
  };

  const handlePdfFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Tab title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 2. SAVE CHANGES (POST/PUT) ---
  const saveChanges = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", title);
    
    // Append file only if user picked a new one
    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }

    try {
      const url = editingId 
        ? `/api/committees/${editingId}` 
        : "/api/committees";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
      });

      if (res.ok) {
        await fetchCommittees(); // Refresh list
        setIsEditing(false);
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Server error");
    }
  };

  // --- 3. DELETE (DELETE) ---
  const triggerDeleteTab = (id) => {
    setDeleteConfig({ type: 'TAB', tabId: id });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { tabId } = deleteConfig;
    if (tabId) {
      try {
        await fetch(`/api/committees/${tabId}`, {
          method: "DELETE",
        });
        await fetchCommittees();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
    setShowConfirm(false);
    setDeleteConfig({ type: null, tabId: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Committees/Cell</h1>
          <button 
            onClick={startAddingTab} 
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md hover:bg-blue-400/40 transition-colors"
          >
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading committees...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tabs.length === 0 && (
               <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400">
                 No committees added yet.
               </div>
            )}

            {tabs.map(tab => (
              <div key={tab.id} className="relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-red-50 p-4 rounded-2xl">
                        <FileText size={28} className="text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-800 mb-1">{tab.title}</h3>
                        {tab.pdfFile ? (
                          <div className="flex flex-col gap-1">
                             <span className="text-xs text-slate-500">Uploaded on {formatDate(tab.pdfFile.uploadedDate)}</span>
                             <a href={tab.pdfFile.url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                               View PDF
                             </a>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">No PDF uploaded</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(tab)} className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-full transition-colors">
                        <Pencil size={18}/>
                      </button>
                      <button onClick={() => triggerDeleteTab(tab.id)} className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-full transition-colors">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
                
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <h2 className="text-xl font-semibold text-slate-800">{editingId ? "Update Committees/Cell" : "Add Committees/Cell"}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-semibold text-slate-800">Tab Title <span className="text-red-500">*</span></label>
                      {errors.title && <p className="text-red-500 text-sm">*Required</p>}
                    </div>
                    <input 
                      className={`w-full text-lg font-normal p-2 border-2 rounded-xl focus:border-blue-500 outline-none pb-2 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter tab title"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-b pb-2">PDF File</h4>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                      {pdfFile ? (
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <span className="text-sm text-blue-800 truncate">{pdfFile.name}</span>
                          <button onClick={() => setPdfFile(null)} className="text-red-500"><X size={16} /></button>
                        </div>
                      ) : (
                        <div>
                           {editingId && currentFileName && (
                             <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                               Current File: <strong>{currentFileName}</strong>
                             </div>
                           )}
                           <label className="cursor-pointer block">
                            <input type="file" accept=".pdf" hidden onChange={handlePdfFileSelect} />
                            <p className="text-blue-600 font-medium">{editingId ? "Click to Change PDF" : "Click to upload PDF"}</p>
                            <p className="text-xs text-slate-400 mt-1">Maximum size 5MB</p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-white">
                  <ActionButtons isAdding={!editingId} onSave={saveChanges} onCancel={() => setIsEditing(false)} />
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

export default CommitteesCell;