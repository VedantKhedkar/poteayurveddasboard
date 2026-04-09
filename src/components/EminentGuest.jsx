"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Users, X, UserPlus,
  Image as ImageIcon, Upload, Edit2, Star,
  ChevronRight, Save, Trash2, Info
} from 'lucide-react';

// Guest data - simplified
const initialGuests = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    designation: "AI Research Director at NeuroTech",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    featured: true
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    designation: "Former Ambassador & Diplomat",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    featured: false
  },
  {
    id: 3,
    name: "Prof. James Wilson",
    designation: "Head of Physics, Cambridge University",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    featured: true
  },
  {
    id: 4,
    name: "Prof. James Wilson",
    designation: "Head of Physics, Cambridge University",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    featured: true
  },
];

const EminentGuestsDashboard = () => {
  // State management
  const [guests, setGuests] = useState(initialGuests);
  const [filteredGuests, setFilteredGuests] = useState(initialGuests);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    designation: '',
    image: ''
  });
  const [editedGuest, setEditedGuest] = useState({
    id: null,
    name: '',
    designation: '',
    image: '',
    featured: false
  });
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Filter guests based on search
  useEffect(() => {
    let result = guests;

    if (searchTerm) {
      result = result.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGuests(result);
  }, [searchTerm, guests]);

  // Stats calculations
  const totalGuests = guests.length;
  const featuredGuests = guests.filter(g => g.featured).length;

  // Handle adding new guest
  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.designation) {
      alert('Please fill in required fields');
      return;
    }

    const newGuestObj = {
      id: guests.length + 1,
      ...newGuest,
      image: newGuest.image || '',
      featured: false
    };

    setGuests([...guests, newGuestObj]);
    setNewGuest({
      name: '',
      designation: '',
      image: ''
    });
    setShowAddForm(false);
  };

  // Toggle featured status
  const toggleFeatured = (guestId, e) => {
    // Prevent event bubbling so clicking the star doesn't trigger the card click
    if (e) e.stopPropagation();

    const updatedGuests = guests.map(guest =>
      guest.id === guestId
        ? { ...guest, featured: !guest.featured }
        : guest
    );

    setGuests(updatedGuests);
  };

  // Start editing guest
  const startEditing = (guest) => {
    setEditedGuest({
      id: guest.id,
      name: guest.name,
      designation: guest.designation,
      image: guest.image,
      featured: guest.featured
    });
    setShowEditForm(true);
  };

  // Handle edit input changes
  const handleEditChange = (field, value) => {
    setEditedGuest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited guest
  const saveEditedGuest = () => {
    if (!editedGuest.name || !editedGuest.designation) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedGuests = guests.map(guest =>
      guest.id === editedGuest.id ? editedGuest : guest
    );

    setGuests(updatedGuests);
    setShowEditForm(false);

    // Show success message
    alert(`Guest "${editedGuest.name}" updated successfully!`);
  };

  // Cancel editing
  const cancelEditing = () => {
    setShowEditForm(false);
    setEditedGuest({
      id: null,
      name: '',
      designation: '',
      image: '',
      featured: false
    });
  };

  // Show delete confirmation
  const confirmDelete = (guest) => {
    setGuestToDelete(guest);
    setShowDeleteConfirm(true);
  };

  // Delete guest
  const deleteGuest = () => {
    if (!guestToDelete) return;

    const updatedGuests = guests.filter(guest => guest.id !== guestToDelete.id);
    setGuests(updatedGuests);

    setGuestToDelete(null);
    setShowDeleteConfirm(false);

    alert('Guest deleted successfully!');
  };

  // Cancel delete
  const cancelDelete = () => {
    setGuestToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
  };

  // Handle image upload for add form
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewGuest({ ...newGuest, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for edit form
  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedGuest({ ...editedGuest, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image click for upload in add form (only when no image)
  const handleImageClick = () => {
    if (!newGuest.image) {
      fileInputRef.current?.click();
    }
  };

  // Handle image click for upload in edit form (only when no image)
  const handleEditImageClick = () => {
    if (!editedGuest.image) {
      editFileInputRef.current?.click();
    }
  };

  // Guest Card Component
  const GuestCard = ({ guest }) => (
    <div className="relative bg-white w-64 rounded-xl shadow-xl overflow-hidden text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <div className="h-52 bg-gray-100 overflow-hidden">
          {guest.image ? (
            <img
              src={guest.image}
              alt={guest.name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <UserPlus className="text-gray-400" size={48} />
            </div>
          )}
        </div>

        {/* Featured Star Button - Top Right */}
        <button
          onClick={(e) => toggleFeatured(guest.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${guest.featured
              ? 'bg-yellow-400 hover:bg-yellow-500 shadow-lg'
              : 'bg-white/80 hover:bg-white shadow hover:shadow-lg'
            }`}
          title={guest.featured ? 'Remove from featured' : 'Mark as featured'}
        >
          <Star
            size={20}
            className={
              guest.featured
                ? 'text-white fill-white'
                : 'text-gray-400 hover:text-yellow-500'
            }
            fill={guest.featured ? 'currentColor' : 'none'}
          />
        </button>

        {/* Edit and Delete Buttons - Bottom Right Corner of Image */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={() => startEditing(guest)}
            className="p-2 bg-blue-200 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200 shadow-lg"
            title="Edit guest"
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={() => confirmDelete(guest)}
            className="p-2 bg-red-200 text-red-600 rounded-full hover:bg-red-100 transition-colors duration-200 shadow-lg"
            title="Delete guest"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-2">{guest.name}</h3>
        <p className="text-gray-600 text-base ">{guest.designation}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Main Content Container */}
        <div className="transition-all duration-300">
          {/* Header */}
          <header className="mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="w-full">
                <h2 className="text-2xl md:text-3xl mb-4 font-extrabold text-gray-800">
                  Eminent Guests
                </h2>
               
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 w-44 bg-blue-400/30 text-blue-950 rounded-lg transition flex items-center gap-1 shadow-lg hover:shadow-xl font-semibold"
              >
                <UserPlus size={20} />
                Add Guest
              </button>
            </div>
          </header>

          {/* Guest Cards Grid */}
          <div className="py-8 md:py-12">
            <div className="px-4 md:px-8">
              <div className="grid justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredGuests.map(guest => (
                  <GuestCard key={guest.id} guest={guest} />
                ))}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredGuests.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-2xl font-medium text-gray-700 mb-2">No guests found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "No guests match your search. Try a different search term."
                  : "No guests available. Add your first guest to get started."}
              </p>
              {searchTerm ? (
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-400/30 text-blue-950 rounded-lg transition inline-flex items-center gap-2"
                >
                  <Search size={18} />
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-400/30 text-blue-950 rounded-lg transition inline-flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Add First Guest
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add Guest Form - Fixed position sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showAddForm ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* Form Header */}
            <div className="border-b p-4 flex justify-between items-center  shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Add New Guest</h3>
                
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Image Upload Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Guest Image
                    </label>

                    {/* Image Tips - i icon placed after the label */}
                    <div className="relative group">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"
                        aria-label="Image tips"
                      >
                        <Info size={14} />
                      </button>

                      {/* Tooltip on hover - Fixed positioning to prevent overflow */}
                      <div className="absolute left-0 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <ImageIcon size={16} className="text-blue-600" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-800 mb-1">Image Tips</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>• Use square images (1:1 aspect ratio)</li>
                              <li>• Recommended size: 500x500 pixels</li>
                              <li>• Supported formats: JPG, PNG, GIF</li>
                              <li>• Max file size: 5MB</li>
                              <li>• For best quality, use high-resolution images</li>
                            </ul>
                          </div>
                        </div>
                        {/* Tooltip arrow - centered */}
                        <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Image Container */}
                  <div className="mb-4">
                    {newGuest.image ? (
                      <div className="relative aspect-square w-64 h-64 max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                        <img
                          src={newGuest.image}
                          alt="Preview"
                          className="w-64 h-64 object-cover"
                        />
                        
                        {/* Remove button on top-right */}
                        <button
                          type="button"
                          onClick={() => setNewGuest({ ...newGuest, image: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="aspect-square w-64 h-64 max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                        onClick={handleImageClick}
                      >
                        <div className="mb-4 ">
                          <ImageIcon className="text-gray-400 group-hover:text-blue-500 transition-colors" size={48} />
                          
                        </div>
                        <p className="text-gray-500 group-hover:text-blue-700 transition-colors text-center">Click to upload image</p>
                        <p className="text-gray-400 text-sm text-center mt-2">or drag and drop</p>
                      </div>
                    )}

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2  focus:border-transparent"
                    placeholder="Enter guest name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={newGuest.designation}
                    onChange={(e) => setNewGuest({ ...newGuest, designation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    placeholder="Enter designation/role"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="border-t p-6 bg-gray-50 shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setNewGuest({
                      name: '',
                      designation: '',
                      image: ''
                    });
                    setShowAddForm(false);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGuest}
                  className="flex-1 px-4 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  Add Guest
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Guest Form - Fixed position sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showEditForm ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {showEditForm && (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Form Header */}
              <div className="border-b p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Edit Guest</h3>
                  <p className="text-sm text-gray-600 mt-1">Update guest details below</p>
                </div>
                <button
                  onClick={cancelEditing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Image Upload Section - Edit Mode */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Guest Image
                      </label>

                      {/* Image Tips - i icon placed after the label */}
                      <div className="relative group">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"
                          aria-label="Image tips"
                        >
                          <Info size={14} />
                        </button>

                        {/* Tooltip on hover */}
                        <div className="absolute left-0 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <ImageIcon size={16} className="text-blue-600" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-gray-800 mb-1">Image Tips</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Use square images (1:1 aspect ratio)</li>
                                <li>• Recommended size: 500x500 pixels</li>
                                <li>• Supported formats: JPG, PNG, GIF</li>
                                <li>• Max file size: 5MB</li>
                                <li>• For best quality, use high-resolution images</li>
                              </ul>
                            </div>
                          </div>
                          <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
                        </div>
                      </div>
                    </div>

                    {/* Image Container - Edit Mode */}
                    <div className="mb-4">
                      {editedGuest.image ? (
                        <div className="relative aspect-square w-64 h-64 max-w-xs mx-auto rounded-xl overflow-hidden  shadow-lg">
                          <img
                            src={editedGuest.image}
                            alt={editedGuest.name}
                            className="w-64 h-64 object-cover"
                          />

                          {/* Remove button on top-right - Edit Mode */}
                          <button
                            type="button"
                            onClick={() => setEditedGuest({ ...editedGuest, image: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition shadow-lg"
                            title="Remove image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="aspect-square w-64 h-64 max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                          onClick={handleEditImageClick}
                        >
                          <div className="mb-4 relative">
                            <ImageIcon className="text-gray-400 group-hover:text-blue-500 transition-colors" size={48} />
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5">
                              <Upload size={16} className="text-white" />
                            </div>
                          </div>
                          <p className="text-gray-500 group-hover:text-blue-700 transition-colors text-center">Click to upload image</p>
                          <p className="text-gray-400 text-sm text-center mt-2">or drag and drop</p>
                        </div>
                      )}

                      {/* Hidden file input for edit */}
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      value={editedGuest.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Enter guest name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={editedGuest.designation}
                      onChange={(e) => handleEditChange('designation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Enter designation/role"
                      required
                    />
                  </div>

                 

                  
                </div>
              </div>

              {/* Form Footer */}
              <div className="border-t p-6 bg-gray-50 shrink-0">
                <div className="flex flex-col gap-3">
                  
                  
                  <div className="flex gap-3">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-4 py-3 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedGuest}
                      className="flex-1 px-4 py-3 bg-blue-400/30 text-blue-950 text-sm rounded-lg  transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && guestToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 mx-4">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Guest
                </h3>
                <p className="text-gray-600 text-center">
                  Are you sure you want to delete <span className="font-semibold">"{guestToDelete.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteGuest}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Guest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay for sidebar */}
        {(showAddForm || showEditForm) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
            onClick={() => {
              if (showAddForm) setShowAddForm(false);
              if (showEditForm) cancelEditing();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EminentGuestsDashboard;