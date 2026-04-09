"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, FileText, Plus, X, Folder, GripVertical } from "lucide-react";
import axios from "axios";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

// Backend API URL
const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/new-updates`;

const NewComponent = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [deleteConfig, setDeleteConfig] = useState({
    type: null,
    tabId: null,
    sectionId: null,
    pdfId: null,
  });
  const [editingSectionId, setEditingSectionId] = useState(null);

  const [formData, setFormData] = useState({ title: "", sections: [] });
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  // Drag and Drop Refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // --- 1. FETCH DATA FROM BACKEND ---
  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL);

      const transformed = res.data.map((tab) => ({
        id: tab.id,
        title: tab.title,
        sections: (tab.sections || []).map((sec) => ({
          id: sec.id,
          sectionTitle: sec.title,
          pdfFiles: (sec.pdfs || []).map((pdf) => ({
            id: pdf.id,
            name: pdf.name,
            url: pdf.pdfPath,
          })),
        })),
      }));
      setTabs(transformed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  // --- DRAG AND DROP HANDLERS ---
  
  // Reorder Main Tabs
  const handleTabSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    
    const _tabs = [...tabs];
    const draggedItemContent = _tabs.splice(dragItem.current, 1)[0];
    _tabs.splice(dragOverItem.current, 0, draggedItemContent);
    
    setTabs(_tabs);

    // Save order to backend
    try {
        await axios.put(`${API_URL}/reorder`, { 
            orderedIds: _tabs.map(t => t.id) 
        });
    } catch (err) {
        console.error("Failed to save tab order", err);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Reorder Sections inside Form
  const handleSectionSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const _sections = [...formData.sections];
    const draggedItemContent = _sections.splice(dragItem.current, 1)[0];
    _sections.splice(dragOverItem.current, 0, draggedItemContent);
    
    setFormData({ ...formData, sections: _sections });
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleTabTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
  };

  const handleSectionTitleChange = (sId, val) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sId ? { ...s, sectionTitle: val } : s,
      ),
    }));
  };

  const triggerDeleteTab = (id) => {
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

    try {
      if (type === "TAB") {
        if (!tabId) return;
        await axios.delete(`${API_URL}/${tabId}`);
        await fetchUpdates();
      } else if (type === "SECTION") {
        setFormData((prev) => ({
          ...prev,
          sections: prev.sections.filter((s) => s.id !== sectionId),
        }));
      } else if (type === "PDF") {
        setFormData((prev) => ({
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === sectionId
              ? { ...s, pdfFiles: s.pdfFiles.filter((p) => p.id !== pdfId) }
              : s
          ),
        }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowConfirm(false);
      setDeleteConfig({ type: null, tabId: null, sectionId: null, pdfId: null });
    }
  };

  const startEditing = (tab) => {
    setEditingId(tab.id);
    setFormData(JSON.parse(JSON.stringify(tab)));
    setIsEditing(true);
    setEditingSectionId(null);
  };

  const startAddingTab = () => {
    setEditingId(null);
    setFormData({ title: "", sections: [] });
    setIsEditing(true);
  };

  const addSection = () => {
    const newId = Date.now();
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: newId, sectionTitle: "", pdfFiles: [] },
      ],
    }));
    setEditingSectionId(newId);
  };

  const handlePdfUpload = (sectionId) => {
    const tempId = `file_${Date.now()}`;
    const newPdf = {
      id: Date.now(),
      name: pdfTitle || "New Document.pdf",
      tempId: tempId,
      rawFile: pdfFile,
    };
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, pdfFiles: [...s.pdfFiles, newPdf] } : s,
      ),
    }));
    setPdfTitle("");
    setPdfFile(null);
  };

  const saveChanges = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: "Required" });
      return;
    }

    const submitData = new FormData();
    const payload = {
      id: editingId,
      title: formData.title,
      sections: formData.sections.map((sec) => ({
        sectionTitle: sec.sectionTitle,
        pdfFiles: sec.pdfFiles.map((p) => ({
          name: p.name,
          url: p.url || null,
          tempId: p.tempId || null,
        })),
      })),
    };

    submitData.append("tabData", JSON.stringify(payload));

    formData.sections.forEach((sec) => {
      sec.pdfFiles.forEach((p) => {
        if (p.rawFile) {
          submitData.append(p.tempId, p.rawFile);
        }
      });
    });

    try {
      await axios.post(API_URL, submitData);
      fetchUpdates();
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Updates</h1>
          <button
            onClick={startAddingTab}
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md hover:bg-blue-400/40 transition-all"
          >
            <Plus size={20} /> Add Tab
          </button>
        </div>

        {isLoading ? (
  <div className="text-center py-20 text-slate-500">Loading modules...</div>
) : (
  <div className="grid grid-cols-1 gap-6">
    {tabs.map((tab, index) => (
      <div
        key={tab.id}
        draggable
        onDragStart={() => (dragItem.current = index)}
        onDragEnter={() => (dragOverItem.current = index)}
        onDragEnd={handleTabSort}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center group transition-all hover:border-blue-300"
      >
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-slate-800">{tab.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{tab.sections?.length || 0} sections</p>
          </div>
        </div>

        {/* Action Group: Drag (Left), Edit (Middle), Delete (Right) */}
        <div className="flex items-center gap-2">
          
          {/* 1. DRAG OPTION (Now on the Left) */}
          <div 
            className="p-2 text-slate-400 hover:text-blue-500 cursor-move transition-colors rounded-full hover:bg-blue-50"
            title="Drag to Reorder"
          >
            <GripVertical size={20} />
          </div>

          {/* 2. EDIT OPTION (Now in the Middle) */}
          <button
            onClick={() => startEditing(tab)}
            className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            title="Edit Tab"
          >
            <Pencil size={18} />
          </button>

          {/* 3. DELETE OPTION (Stays on the Right) */}
          <button
            onClick={() => triggerDeleteTab(tab.id)}
            className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
            title="Delete Tab"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>
)}

        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <h2 className="text-xl font-semibold text-slate-800">{editingId ? "Edit Tab" : "New Tab"}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  <div>
                    <label className="text-xs font-medium text-slate-800 mb-2 block">Tab Title *</label>
                    <input
                      className={`w-full text-lg border-2 rounded-xl p-2 outline-none ${errors.title ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-blue-500"}`}
                      value={formData.title}
                      onChange={handleTabTitleChange}
                      placeholder="Enter title"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2"><Folder size={18} /> Sections</h4>
                      <button
                        onClick={addSection}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg"
                      >
                        <Plus size={16} /> Add Section
                      </button>
                    </div>

                    {formData.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        draggable
                        onDragStart={() => (dragItem.current = idx)}
                        onDragEnter={() => (dragOverItem.current = idx)}
                        onDragEnd={handleSectionSort}
                        onDragOver={(e) => e.preventDefault()}
                        className={`p-6 rounded-3xl border transition-all ${editingSectionId === section.id ? "border-blue-400 bg-white shadow-sm" : "border-slate-200 bg-slate-50"}`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              {editingSectionId === section.id ? (
                                <input
                                  autoFocus
                                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-400"
                                  value={section.sectionTitle}
                                  onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                                  placeholder="Section title"
                                />
                              ) : (
                                <h5 className="text-lg font-medium text-slate-800">{section.sectionTitle || "Untitled Section"}</h5>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {editingSectionId === section.id ? (
                              <button onClick={() => setEditingSectionId(null)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg">Save Section</button>
                            ) : (
                              <button onClick={() => setEditingSectionId(section.id)} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Pencil size={14} /></button>
                            )}
                            
                            {/* Grip Icon for Section Dragging */}
                            <div className="p-2 text-slate-400 cursor-move hover:text-blue-500">
                                <GripVertical size={16} />
                            </div>

                            <button onClick={() => triggerDeleteSection(section.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {section.pdfFiles.map((pdf) => (
                            <div key={pdf.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                              <FileText className="text-red-500" size={20} />
                              <span className="flex-1 text-sm truncate">{pdf.name}</span>
                              <button onClick={() => triggerDeletePdf(section.id, pdf.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                          ))}

                          {editingSectionId === section.id && (
                            <div className="mt-4 p-4 border border-dashed rounded-xl border-slate-300 bg-white">
                              <input
                                type="text"
                                value={pdfTitle}
                                onChange={(e) => setPdfTitle(e.target.value)}
                                className="w-full text-sm p-2 mb-2 border rounded"
                                placeholder="PDF Display Name"
                              />
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                className="text-xs mb-4 block"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePdfUpload(section.id)}
                                  disabled={!pdfTitle || !pdfFile}
                                  className="text-xs bg-blue-600 text-white px-4 py-2 rounded disabled:bg-slate-300"
                                >
                                  Add PDF
                                </button>
                                <button
                                  onClick={() => { setPdfTitle(""); setPdfFile(null); setEditingSectionId(null); }}
                                  className="text-xs bg-slate-200 px-4 py-2 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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

      <DeleteModal
        show={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default NewComponent;