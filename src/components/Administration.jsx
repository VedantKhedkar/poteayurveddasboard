"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Image as ImageIcon, Edit2, Trash2, User } from "lucide-react";

const CardManager = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [cards, setCards] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    noteTitle: "",
    salutation: "",
    content: "",
    image: null,
    rawFile: null,
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin-cards");
      const data = await res.json();

      // Transform DB keys to UI keys
      const formattedCards = data.map((card) => ({
        id: card.id,
        name: card.name,
        title: card.title,
        noteTitle: card.note_title,
        salutation: card.salutation,
        content: card.content,
        image: card.image_url,
      }));

      setCards(formattedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      title: "",
      noteTitle: "",
      salutation: "",
      content: "",
      image: null,
      rawFile: null,
    });
  };

  const handleEdit = (card) => {
    setEditingId(card.id);
    setFormData({ ...card, rawFile: null }); // Keep existing image URL for preview
    setIsDrawerOpen(true);
  };

  // --- 2. DELETE ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await fetch(`/api/admin-cards/${id}`, {
          method: "DELETE",
        });
        fetchCards();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  // --- 3. SUBMIT (CREATE/UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("title", formData.title);
    submitData.append("noteTitle", formData.noteTitle);
    submitData.append("salutation", formData.salutation);
    submitData.append("content", formData.content);
    if (formData.rawFile) {
      submitData.append("image", formData.rawFile);
    }

    try {
      const url = editingId
        ? `/api/admin-cards/${editingId}`
        : "/api/admin-cards";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: submitData,
      });

      if (res.ok) {
        await fetchCards();
        handleCloseDrawer();
      } else {
        alert("Failed to save card");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-blue-400/30 text-blue-950 px-6 py-2 rounded-3xl font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading cards...</div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10">
          {cards.length === 0 && (
            <div className="text-center text-gray-400">
              No administration cards added yet.
            </div>
          )}

          {cards.map((card) => (
            <div
              key={card.id}
              className="relative bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[500px]"
            >
              {/* Edit/Delete Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={() => handleEdit(card)}
                  className="p-2 bg-blue-200 hover:bg-blue-100 text-blue-600 rounded-full shadow border transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-2 bg-red-200 hover:bg-red-100 text-red-600 rounded-full shadow border transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Left Section: Profile Image & Name */}
              <div className="w-full md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 ">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-gray-50 shadow-inner overflow-hidden mb-6 flex items-center justify-center bg-gray-100">
                  {card.image ? (
                    <img
                      src={ `${card.image}` }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-gray-300" />
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-1 text-center">
                  {card.name}
                </h2>
                <p className="text-gray-600 font-medium text-lg">
                  {card.title}
                </p>
              </div>

              {/* Right Section: Content */}
              <div className="w-full md:w-2/3 p-8 md:p-12 relative">
                <div className="absolute left-0 top-12 bottom-12 w-1 bg-orange-500 hidden md:block"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8 pl-0">
                  {card.noteTitle}
                </h1>

                <div className="space-y-6 text-gray-700 leading-relaxed text-justify">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {card.salutation}
                  </h3>
                  <div className="whitespace-pre-wrap">{card.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Form Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleCloseDrawer}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? "Edit Note" : "Create New Note"}
            </h2>
            <button
              onClick={handleCloseDrawer}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 flex-1 overflow-y-auto space-y-4"
          >
            {/* Image Upload */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-full mx-auto flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden bg-gray-50 group relative"
            >
              {formData.image ? (
                <img
                  src={formData.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="text-center text-gray-400 flex flex-col items-center">
                  <User
                    size={80}
                    className="text-gray-200 group-hover:text-gray-300 transition-colors"
                  />
                  <span className="text-xs font-bold mt-2">
                    CLICK TO UPLOAD
                  </span>
                </div>
              )}
              {/* Overlay for change indication */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                <ImageIcon size={24} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setFormData({
                        ...formData,
                        image: ev.target.result,
                        rawFile: file,
                      });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-600">
                  Authority Name
                </span>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-600">
                  Designation
                </span>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-600">
                  Heading (e.g. Chairman's Note)
                </span>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.noteTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, noteTitle: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-600">
                  Salutation
                </span>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.salutation}
                  onChange={(e) =>
                    setFormData({ ...formData, salutation: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-600">
                  Note Content
                </span>
                <textarea
                  required
                  rows="6"
                  className="w-full mt-1 border rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white mt-auto">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-medium shadow-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardManager;
