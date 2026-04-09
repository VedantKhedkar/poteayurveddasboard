"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, FileText, Plus, X, Folder, FilePlus, Check, Upload, AlertCircle, Info } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const MUHS = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deleteConfig, setDeleteConfig] = useState({ type: null, tabId: null, sectionId: null, fileId: null });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [formData, setFormData] = useState({ title: "", sections: [] });

  const [activePdfUploads, setActivePdfUploads] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [tabDeleteWarning, setTabDeleteWarning] = useState({ show: false, tabId: null });
  const [isEditingExistingTab, setIsEditingExistingTab] = useState(false);

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    fetchMuhsData();
  }, []);

  const fetchMuhsData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/muhs");
      const data = await res.json();

      const transformed = data.map(tab => ({
        id: tab.id,
        title: tab.title,
        sections: (tab.sections || []).map(section => ({
          id: section.id,
          sectionTitle: section.title, // map title → sectionTitle
          files: (section.pdfs || []).map(pdf => ({
            id: pdf.id,
            name: pdf.name,
            url: pdf.pdf_path, // map pdf_path → url
            uploadDate: pdf.uploadedDate,
          }))
        }))
      }));

      setTabs(transformed);
    } catch (error) {
      console.error("Error loading MUHS data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize formData when editing starts
  useEffect(() => {
    if (isEditing && editingId) {
      const tabToEdit = tabs.find(tab => tab.id === editingId);
      if (tabToEdit) {
        setFormData(JSON.parse(JSON.stringify(tabToEdit)));
        setIsEditingExistingTab(true);
        setFormErrors({});
      }
    } else if (isEditing && !editingId) {
      setIsEditingExistingTab(false);
    }
  }, [isEditing, editingId, tabs]);

  // --- DELETE HANDLERS ---
  const triggerDeleteTab = (id) => {
    const tab = tabs.find(t => t.id === id);
    if (tab && tab.sections && tab.sections.length > 0) {
      setTabDeleteWarning({ show: true, tabId: id });
      return;
    }
    setDeleteConfig({ type: 'TAB', tabId: id });
    setShowConfirm(true);
  };

  const triggerDeleteSection = (sId) => {
    setDeleteConfig({ type: 'SECTION', sectionId: sId });
    setShowConfirm(true);
  };

  const triggerDeleteFile = (sId, fId) => {
    setDeleteConfig({ type: 'FILE', sectionId: sId, fileId: fId });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { type, tabId, sectionId, fileId } = deleteConfig;

    if (type === 'TAB') {
      try {
        await fetch(`/api/muhs/${tabId}`, { method: 'DELETE' });
        await fetchMuhsData();
      } catch (err) { console.error(err); }

      if (tabDeleteWarning.tabId === tabId) {
        setTabDeleteWarning({ show: false, tabId: null });
      }
    }
    else if (type === 'SECTION') {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
    }
    else if (type === 'FILE') {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? {
          ...s,
          files: s.files.filter(f => f.id !== fileId)
        } : s)
      }));
    }

    setShowConfirm(false);
    setDeleteConfig({ type: null, tabId: null, sectionId: null, fileId: null });
  };

  const handleCloseTabWarning = () => {
    setTabDeleteWarning({ show: false, tabId: null });
  };

  // --- PDF HANDLERS ---
  const showPdfUpload = (sectionId, file = null) => {
    setActivePdfUploads(prev => ({
      ...prev,
      [sectionId]: {
        show: true,
        editingFile: file,
        title: file ? file.name : "",
        selectedFile: null,
        isEditing: !!file
      }
    }));
  };

  const hidePdfUpload = (sectionId) => {
    setActivePdfUploads(prev => {
      const newState = { ...prev };
      delete newState[sectionId];
      return newState;
    });
  };

  const handlePdfTitleChange = (sectionId, value) => {
    setActivePdfUploads(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], title: value }
    }));
  };

  const handleFileSelect = (sectionId, e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setActivePdfUploads(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          selectedFile: file,
          title: prev[sectionId]?.title || file.name.replace('.pdf', '')
        }
      }));
    } else if (file) {
      alert("Please select a PDF file only.");
      e.target.value = '';
    }
  };

  const removeSelectedFile = (sectionId) => {
    setActivePdfUploads(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], selectedFile: null }
    }));
  };

  const handlePdfUpload = (sectionId) => {
    const uploadData = activePdfUploads[sectionId];
    if (!uploadData) return;

    const finalTitle = uploadData.title?.trim();
    if (!finalTitle) {
      alert("Please enter a title for the PDF.");
      return;
    }

    const { editingFile, selectedFile, isEditing } = uploadData;
    const uploadDate = new Date().toISOString();

    // Create temp ID to link file in FormData
    const tempId = selectedFile ? `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

    const newFile = {
      id: isEditing ? editingFile.id : Date.now(),
      name: finalTitle,
      fileName: selectedFile ? selectedFile.name : (editingFile?.fileName || "existing.pdf"),
      uploadDate: isEditing ? editingFile.uploadDate : uploadDate,
      rawFile: selectedFile, // Store raw file for upload
      tempId: tempId,        // Store temp ID
      url: isEditing ? editingFile.url : null
    };

    if (isEditing) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? {
          ...s,
          files: s.files.map(f => f.id === editingFile.id ? newFile : f)
        } : s)
      }));
    } else {
      if (!selectedFile) { alert("Please select a file"); return; }
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? {
          ...s,
          files: [...s.files, newFile]
        } : s)
      }));
    }

    hidePdfUpload(sectionId);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (sectionId, e) => {
    e.preventDefault(); e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setActivePdfUploads(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          selectedFile: files[0],
          title: prev[sectionId]?.title || files[0].name.replace('.pdf', '')
        }
      }));
    } else { alert("Please drop a PDF file only."); }
  };

  // --- VALIDATION & SAVE ---
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Tab title is required';
    if (!isEditingExistingTab && formData.sections.length === 0) {
      errors.sections = "At least one section is required for new tabs";
    }
    formData.sections.forEach((section, index) => {
      if (!section.sectionTitle.trim()) {
        errors[`section-${section.id}`] = `Section ${index + 1} title is required`;
      }
      if (!isEditingExistingTab && section.files.length === 0) {
        errors[`section-file-${section.id}`] = `Section ${index + 1} must have at least one PDF for new tabs`;
      }
    });
    return errors;
  };

  // --- 2. SAVE CHANGES (POST TO BACKEND) ---
  const saveChanges = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const submitData = new FormData();

    // Prepare JSON payload (stripping rawFile)
    const cleanSections = formData.sections.map(sec => ({
      sectionTitle: sec.sectionTitle,
      files: sec.files.map(f => ({
        name: f.name,
        url: f.url,
        tempId: f.tempId
      }))
    }));

    const jsonPayload = {
      id: editingId && String(editingId).length < 10 ? editingId : null,
      title: formData.title,
      sections: cleanSections
    };

    submitData.append('tabData', JSON.stringify(jsonPayload));

    // Append binary files
    formData.sections.forEach(sec => {
      sec.files.forEach(f => {
        if (f.rawFile && f.tempId) {
          submitData.append(f.tempId, f.rawFile);
        }
      });
    });

    try {
      const res = await fetch("/api/muhs", {
        method: "POST",
        body: submitData
      });

      if (res.ok) {
        await fetchMuhsData();
        setIsEditing(false);
        setActivePdfUploads({});
        setFormErrors({});
      } else {
        alert("Failed to save data");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // --- UI LOGIC (Unchanged) ---
  const startEditing = (tab) => {
    setEditingId(tab.id);
    setIsEditing(true);
    setIsEditingExistingTab(true);
    setEditingSectionId(null);
    setActivePdfUploads({});
    setFormErrors({});
    setTabDeleteWarning({ show: false, tabId: null });
  };

  const startAddingTab = () => {
    setEditingId(null);
    setFormData({ title: "", sections: [] });
    setIsEditing(true);
    setIsEditingExistingTab(false);
    setActivePdfUploads({});
    setFormErrors({});
    setTabDeleteWarning({ show: false, tabId: null });
  };

  const addSection = () => {
    const newId = Date.now();
    const newSection = { id: newId, sectionTitle: "", files: [] };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setEditingSectionId(newId);
    if (formErrors.sections) setFormErrors(prev => ({ ...prev, sections: null }));
  };

  const updateSectionTitle = (sId, val) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sId ? { ...s, sectionTitle: val } : s)
    }));
    if (formErrors[`section-${sId}`] && val.trim()) {
      setFormErrors(prev => ({ ...prev, [`section-${sId}`]: null }));
    }
  };

  const handleSectionSave = () => setEditingSectionId(null);

  const cancelEditing = () => {
    setIsEditing(false);
    setActivePdfUploads({});
    setFormErrors({});
    setTabDeleteWarning({ show: false, tabId: null });
  };

  // --- ✅ ADDED MISSING HELPER FUNCTION HERE ---
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // --- SUB-COMPONENT (Unchanged) ---
  const PdfUploadEdit = ({ sectionId }) => {
    const uploadData = activePdfUploads[sectionId];
    const inputRef = useRef(null);
    useEffect(() => {
      if (uploadData?.show && inputRef.current) setTimeout(() => inputRef.current?.focus(), 10);
    }, [uploadData?.show]);

    if (!uploadData?.show) return null;
    const isEditing = uploadData.isEditing;
    const currentFile = uploadData.editingFile;

    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {isEditing ? "Edit PDF" : "Add New PDF *"}
            </label>
            {isEditing && currentFile && !uploadData.selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-slate-700">Current File:</span>
                <span className="text-xs text-slate-600 truncate">{currentFile.name}</span>
              </div>
            )}
            <input ref={inputRef} type="text" value={uploadData.title || ""} onChange={(e) => handlePdfTitleChange(sectionId, e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-3" placeholder="Enter PDF title" required />
            <div className="flex items-center gap-3">
              {uploadData.selectedFile ? (
                <div className="flex-1 flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg"><FileText size={20} className="text-red-500" /></div>
                    <span className="text-sm font-medium truncate">{uploadData.selectedFile.name}</span>
                  </div>
                  <button onClick={() => removeSelectedFile(sectionId)} className="p-1 text-red-500 hover:bg-red-50 rounded" type="button"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors" onDragOver={handleDragOver} onDrop={(e) => handleDrop(sectionId, e)}>
                  <span className="text-sm font-medium text-slate-700">{isEditing ? "Choose new PDF file " : "Choose PDF File *"}</span>
                  <input type="file" accept=".pdf" hidden onChange={(e) => handleFileSelect(sectionId, e)} required />
                </label>
              )}
              <div className="flex gap-2">
                <button onClick={() => handlePdfUpload(sectionId)} disabled={!uploadData.title?.trim() && !isEditing} className={`px-4 py-2 rounded-lg font-medium transition-colors ${(uploadData.title?.trim() || isEditing) ? 'bg-blue-400/30 text-blue-950 cursor-pointer' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`} type="button">{isEditing ? "Update" : "Upload"}</button>
                <button onClick={() => hidePdfUpload(sectionId)} className="px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors" type="button">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">MUHS Mandate</h1>
          <button onClick={startAddingTab} className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md">
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading data...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tabs.length === 0 && <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-300 rounded-3xl">No mandates added yet.</div>}
            {tabs.map(tab => (
              <div key={tab.id} className={`relative bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center group ${tabDeleteWarning.show && tabDeleteWarning.tabId === tab.id ? 'border-red-300' : 'border-slate-200'}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800">{tab.title}</h3>
                    </div>
                    {tabDeleteWarning.show && tabDeleteWarning.tabId === tab.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-4 flex-1 max-w-4xl">
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <div className="bg-red-100 p-1 rounded"><AlertCircle size={14} className="text-red-600" /></div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-red-800">Cannot Delete Tab</p>
                            <p className="text-xs text-red-700">Delete all sections first</p>
                          </div>
                          <button onClick={handleCloseTabWarning} className="text-red-500 hover:text-red-700 p-0.5"><X size={14} /></button>
                        </div>
                      </motion.div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(tab)} className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-full transition-colors"><Pencil size={18} /></button>
                      <button onClick={() => triggerDeleteTab(tab.id)} className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={18} /></button>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelEditing} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <h2 className="text-xl font-semibold text-slate-800">{editingId ? 'Update MUHS Mandate' : 'Add MUHS Mandate'}</h2>
                  <button onClick={cancelEditing} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div><label className="text-[12px] font-medium text-slate-800 block">Tab Title <span className="text-red-500">*</span></label></div>
                      {formErrors.title && <span className="text-xs text-red-600 font-medium">{formErrors.title}</span>}
                    </div>
                    <input className={`w-full text-xl font-normal border-2 p-2 rounded-xl focus:outline-none pb-2 transition-all ${formErrors.title ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (formErrors.title && e.target.value.trim()) setFormErrors(prev => ({ ...prev, title: null })); }} placeholder="Enter tab title" />
                  </div>

                  <div className="space-y-10 pb-10">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2"><Folder size={18} className="text-blue-500" /> Content Sections</h4>
                        {formErrors.sections && <div className="flex items-center gap-1 text-red-500 text-xs"><AlertCircle size={12} /><span>{formErrors.sections}</span></div>}
                      </div>
                      <button onClick={addSection} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"><Plus size={16} /> Add New Section</button>
                    </div>

                    {formData.sections.map((section) => (
                      <div key={section.id} className={`relative p-6 rounded-3xl border transition-all ${editingSectionId === section.id ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex justify-between items-center mb-6 group/sec">
                          <div className="flex-1">
                            {editingSectionId === section.id ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input autoFocus className={`bg-white mr-2 px-2 py-1 rounded border text-lg font-normal text-slate-800 outline-none w-full ${formErrors[`section-${section.id}`] ? 'border-red-400' : 'border-blue-400'}`} value={section.sectionTitle} onChange={(e) => updateSectionTitle(section.id, e.target.value)} placeholder="Enter Tab Title" />
                                </div>
                                {formErrors[`section-${section.id}`] && <div className="flex items-center gap-1 text-red-500 text-xs ml-2"><AlertCircle size={12} /><span>Required</span></div>}
                                {formErrors[`section-file-${section.id}`] && <div className="flex items-center gap-1 text-red-500 text-xs ml-2"><AlertCircle size={12} /><span>At least one PDF is required</span></div>}
                              </div>
                            ) : (
                              <h5 className="text-lg font-normal text-slate-800">{section.sectionTitle || "Untitled Section"}</h5>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {editingSectionId === section.id ? (
                              <button onClick={handleSectionSave} className="px-4 py-2 bg-blue-400/30 text-blue-950 rounded-xl transition-colors text-sm font-medium">Save</button>
                            ) : (
                              <button onClick={() => setEditingSectionId(section.id)} className="p-2 bg-blue-200 text-blue-600 hover:bg-blue-100 rounded-3xl"><Pencil size={16} /></button>
                            )}
                            <button onClick={() => triggerDeleteSection(section.id)} className="p-2 text-red-600 hover:bg-red-100 bg-red-200 rounded-3xl"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {section.files.map((file) => (
                            <div key={file.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 items-center shadow-sm">
                              <div className="p-2 bg-red-100 rounded-lg"><FileText size={30} className="text-red-500" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                {file.uploadDate && <p className="text-[9px] text-slate-500">Uploaded: {formatDate(file.uploadDate)}</p>}
                              </div>
                              {editingSectionId === section.id && (
                                <div className="flex gap-2">
                                  <button onClick={() => showPdfUpload(section.id, file)} className="p-2 text-blue-600 bg-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1" title="Edit PDF"><Pencil size={14} /></button>
                                  <button onClick={() => triggerDeleteFile(section.id, file.id)} className="p-2 text-red-600 bg-red-200 rounded-xl hover:bg-red-100 transition-colors" title="Delete PDF"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                          ))}
                          <PdfUploadEdit sectionId={section.id} />
                          {section.files.length === 0 && !activePdfUploads[section.id]?.show && <div className="text-center py-3 text-slate-400 text-sm">No PDFs uploaded {isEditingExistingTab ? "(Optional for existing tabs)" : ""}</div>}
                          {editingSectionId === section.id && !activePdfUploads[section.id]?.show && (
                            <div className="mt-4">
                              <button onClick={() => showPdfUpload(section.id)} className="w-full p-3 bg-white rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <FilePlus size={18} /> <span className="text-sm font-medium">Add New PDF</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 border-t bg-white">
                  <ActionButtons isAdding={!editingId} onSave={saveChanges} onCancel={cancelEditing} />
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

export default MUHS;