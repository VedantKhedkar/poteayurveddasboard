"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Plus, X, Globe } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const ImportantLinks = () => {
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: null, tabId: null });
  const [formData, setFormData] = useState({ title: "", url: "" });
  const [formErrors, setFormErrors] = useState({ title: "", url: "" });

  // --- 1. FETCH LINKS ---
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/links');
      const data = await res.json();
      setTabs(data);
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE HANDLERS ---
  const triggerDeleteTab = (id) => {
    setDeleteConfig({ type: 'TAB', tabId: id });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { tabId } = deleteConfig;
    try {
      await fetch(`/api/links/${tabId}`, { method: 'DELETE' });
      await fetchLinks(); // Refresh list
    } catch (error) {
      console.error("Delete failed:", error);
    }
    setShowConfirm(false);
    setDeleteConfig({ type: null, tabId: null });
  };

  // --- VALIDATION FUNCTIONS ---
  const validateForm = () => {
    const errors = { title: "", url: "" };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Link title is required";
      isValid = false;
    }

    if (!formData.url.trim()) {
      errors.url = "URL is required";
      isValid = false;
    } else {
      try {
        new URL(formData.url);
      } catch {
        errors.url = "Please enter a valid URL (e.g., https://example.com)";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // --- LOGIC ---
  const startEditing = (tab) => {
    setEditingId(tab.id);
    setFormData({ title: tab.title, url: tab.url });
    setFormErrors({ title: "", url: "" });
    setIsEditing(true);
  };

  const startAddingTab = () => {
    setEditingId(null);
    setFormData({ title: "", url: "" });
    setFormErrors({ title: "", url: "" });
    setIsEditing(true);
  };

  // --- SAVE CHANGES ---
  const saveChanges = async () => {
    if (!validateForm()) return;

    try {
      const url = editingId 
        ? `/api/links/${editingId}`
        : '/api/links';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchLinks(); // Refresh list
        setIsEditing(false);
        setFormErrors({ title: "", url: "" });
      } else {
        alert("Failed to save link");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (formErrors[field]) setFormErrors({...formErrors, [field]: ""});
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Important Links</h1>
          <button 
            onClick={startAddingTab} 
            className="bg-blue-400/30 text-blue-950 font-medium px-5 py-2.5 rounded-3xl flex items-center gap-2 shadow-md hover:bg-blue-400/40 transition-colors"
          >
            <Plus size={20} /> Add Link
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading links...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tabs.map(tab => (
              <div key={tab.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between ">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <Globe size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-slate-800 truncate">{tab.title}</h3>
                      <a href={tab.url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate mt-1 block">
                        {tab.url}
                      </a>
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
            ))}
            {tabs.length === 0 && (
               <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400">
                 No links added yet.
               </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                  <h2 className="text-xl font-semibold text-slate-800">{editingId ? "Update Link" : "Add Link"}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[12px] font-semibold text-slate-400 mb-2 block">Link Title *</label>
                      <input className="w-full text-lg font-medium border-b-2 border-slate-100 focus:border-blue-500 outline-none pb-2" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Enter Link Title" />
                      {formErrors.title && <p className="text-red-500 text-sm mt-2">{formErrors.title}</p>}
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-slate-400 mb-2 block">URL *</label>
                      <div className={`flex items-center gap-3 border-b-2 pb-2 ${formErrors.url ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                        <Globe size={18} className="text-slate-400" />
                        <input className="w-full text-sm outline-none" value={formData.url} onChange={(e) => handleInputChange("url", e.target.value)} placeholder="https://example.com" />
                      </div>
                      {formErrors.url && <p className="text-red-500 text-sm mt-2">{formErrors.url}</p>}
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

export default ImportantLinks;