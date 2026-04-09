"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, UserPlus, Image as ImageIcon, Edit2, Star, Trash2, GripHorizontal } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

// Media Server Config
const MEDIA_Download = "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";
const MEDIA_Upload = "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";

// LOCAL SETUP: API Base
const API_BASE = "http://localhost:4001/api/university-details";

const UniversityDetails = () => {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // ✅ Added noteTitle and noteContent
  const [newGuest, setNewGuest] = useState({
    name: "", designation: "", image: "", noteTitle: "", noteContent: "", imageFile: null,
  });

  const [editedGuest, setEditedGuest] = useState({
    id: null, name: "", designation: "", image: "", noteTitle: "", noteContent: "", featured: false, imageFile: null,
  });

  const [guestToDelete, setGuestToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading details:", err);
      setGuests([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, []);

  const uploadImage = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(MEDIA_Upload, { method: "POST", body: fd });
      const data = await res.json();
      if (data.uploadedImages && data.uploadedImages.length > 0) {
        return data.uploadedImages[0].filename;
      }
      return "";
    } catch (err) {
      return "";
    }
  };

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.designation) return alert("Please fill Name and Designation");
    try {
      let filename = "";
      if (newGuest.imageFile) filename = await uploadImage(newGuest.imageFile);

      // ✅ Sending noteTitle and noteContent to backend
      const payload = {
        name: newGuest.name, designation: newGuest.designation, image: filename,
        noteTitle: newGuest.noteTitle, noteContent: newGuest.noteContent, featured: false,
      };

      const res = await fetch(API_BASE, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchDetails(); setShowAddForm(false);
        setNewGuest({ name: "", designation: "", image: "", noteTitle: "", noteContent: "", imageFile: null });
      }
    } catch (err) { console.error("Save failed:", err); }
  };

  const saveEditedGuest = async () => {
    if (!editedGuest.name || !editedGuest.designation) return alert("Please fill Name and Designation");
    try {
      let filename = editedGuest.image;
      if (editedGuest.imageFile) filename = await uploadImage(editedGuest.imageFile);

      // ✅ Sending updated noteTitle and noteContent to backend
      const payload = {
        name: editedGuest.name, designation: editedGuest.designation, image: filename,
        noteTitle: editedGuest.noteTitle, noteContent: editedGuest.noteContent, featured: editedGuest.featured,
      };

      const res = await fetch(`${API_BASE}/${editedGuest.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (res.ok) { fetchDetails(); setShowEditForm(false); }
    } catch (err) { console.error("Update failed:", err); }
  };

  const deleteGuest = async () => {
    try {
      const res = await fetch(`${API_BASE}/${guestToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== guestToDelete.id));
        setShowDeleteConfirm(false); setGuestToDelete(null);
      }
    } catch (err) {}
  };

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...guests];
    const draggedItem = newOrder.splice(dragItem.current, 1)[0];
    newOrder.splice(dragOverItem.current, 0, draggedItem);
    setGuests(newOrder);

    try {
      await fetch(`${API_BASE}/reorder`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: newOrder.map(g => g.id) }),
      });
    } catch (err) { fetchDetails(); }
    dragItem.current = null; dragOverItem.current = null;
  };

  const handleFileChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) setEditedGuest({ ...editedGuest, imageFile: file });
      else setNewGuest({ ...newGuest, imageFile: file });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative">
        <header className="mb-8 md:mb-12 flex justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">Details of Affiliated University</h2>
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-blue-400/30 text-blue-950 rounded-lg shadow-lg font-semibold flex items-center gap-2">
            <UserPlus size={20} /> Add Detail
          </button>
        </header>

        {isLoading ? ( <div className="text-center py-20 text-gray-500">Loading details...</div> ) : (
          <div className="grid justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {guests.map((guest, index) => (
              <div key={guest.id} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="relative bg-white w-64 rounded-xl shadow-xl overflow-hidden text-center border border-gray-100 cursor-move group">
                <div className="relative">
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    {guest.image ? ( <img src={`${MEDIA_Download}/${guest.image}`} alt={guest.name} className="w-full h-full object-cover" /> ) : ( <Users className="text-gray-400 mx-auto mt-20" size={48} /> )}
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button onClick={() => { setEditedGuest({ ...guest, imageFile: null }); setShowEditForm(true); }} className="p-2 bg-blue-200 text-blue-600 rounded-full shadow-lg"> <Edit2 size={16} /> </button>
                    <button onClick={() => { setGuestToDelete(guest); setShowDeleteConfirm(true); }} className="p-2 bg-red-200 text-red-600 rounded-full shadow-lg"> <Trash2 size={16} /> </button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{guest.name}</h3>
                  <p className="text-gray-600 text-base">{guest.designation}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Side Panel */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Add New Detail</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 rounded-full"><X size={24} /></button>
              </div>
              <div className="space-y-6 overflow-y-auto flex-1">
                <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
                  {newGuest.imageFile ? ( <img src={URL.createObjectURL(newGuest.imageFile)} className="w-full h-full object-cover" /> ) : ( <div className="text-gray-400"><ImageIcon size={48} /></div> )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                </div>
                <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} />
                <input type="text" placeholder="Designation" className="w-full p-3 border rounded-lg" value={newGuest.designation} onChange={(e) => setNewGuest({ ...newGuest, designation: e.target.value })} />
                {/* ✅ Naye Inputs */}
                <input type="text" placeholder="Note Title (e.g. Governor Details)" className="w-full p-3 border rounded-lg" value={newGuest.noteTitle} onChange={(e) => setNewGuest({ ...newGuest, noteTitle: e.target.value })} />
                <textarea placeholder="Write detailed note content here..." rows={6} className="w-full p-3 border rounded-lg resize-none" value={newGuest.noteContent} onChange={(e) => setNewGuest({ ...newGuest, noteContent: e.target.value })} />
              </div>
              <ActionButtons isAdding={true} onSave={handleAddGuest} onCancel={() => setShowAddForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Side Panel */}
        <AnimatePresence>
          {showEditForm && (
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Edit Detail</h3>
                <button onClick={() => setShowEditForm(false)} className="p-2 rounded-full"><X size={24} /></button>
              </div>
              <div className="space-y-6 overflow-y-auto flex-1">
                <div onClick={() => editFileInputRef.current.click()} className="w-full aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
                  {editedGuest.imageFile ? ( <img src={URL.createObjectURL(editedGuest.imageFile)} className="w-full h-full object-cover" /> ) : editedGuest.image ? ( <img src={`${MEDIA_Download}/${editedGuest.image}`} className="w-full h-full object-cover" /> ) : ( <ImageIcon size={48} /> )}
                  <input ref={editFileInputRef} type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                </div>
                <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" value={editedGuest.name} onChange={(e) => setEditedGuest({ ...editedGuest, name: e.target.value })} />
                <input type="text" placeholder="Designation" className="w-full p-3 border rounded-lg" value={editedGuest.designation} onChange={(e) => setEditedGuest({ ...editedGuest, designation: e.target.value })} />
                {/* ✅ Naye Inputs */}
                <input type="text" placeholder="Note Title (e.g. Governor Details)" className="w-full p-3 border rounded-lg" value={editedGuest.noteTitle || ""} onChange={(e) => setEditedGuest({ ...editedGuest, noteTitle: e.target.value })} />
                <textarea placeholder="Write detailed note content here..." rows={6} className="w-full p-3 border rounded-lg resize-none" value={editedGuest.noteContent || ""} onChange={(e) => setEditedGuest({ ...editedGuest, noteContent: e.target.value })} />
              </div>
              <ActionButtons isAdding={false} onSave={saveEditedGuest} onCancel={() => setShowEditForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <DeleteModal show={showDeleteConfirm} onConfirm={deleteGuest} onCancel={() => setShowDeleteConfirm(false)} />
      </div>
    </div>
  );
};

export default UniversityDetails;