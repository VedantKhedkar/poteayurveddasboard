// NonTeachingStaffDashboard.jsx
import { Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const NonTeachingStaffDashboard = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '',
    designation: '',
    education: '',
    experience: '',
    image: null,
    imagePreview: '',
    isFeatured: false
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize with dummy data for non-teaching staff
  useEffect(() => {
    const dummyStaff = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        designation: 'Administrative Officer',
        education: 'MBA',
        experience: '8 years',
        image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        isFeatured: true
      },
      {
        id: 2,
        name: 'Priya Sharma',
        designation: 'Lab Assistant',
        education: 'B.Sc. in Chemistry',
        experience: '5 years',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        isFeatured: false
      },
      {
        id: 3,
        name: 'Amit Patel',
        designation: 'Librarian',
        education: 'MLIS',
        experience: '12 years',
        image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        isFeatured: true
      },
        {
        id: 4,
        name: 'Amit Patel',
        designation: 'Librarian',
        education: 'MLIS',
        experience: '12 years',
        image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        isFeatured: true
      },
    ];

    setStaffMembers(dummyStaff);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large! Please upload an image under 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStaff(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewStaff(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim()) {
      alert('Please enter staff name');
      return;
    }

    let imageData = '';
    if (newStaff.imagePreview) {
      imageData = newStaff.imagePreview;
    } else if (isEditing && editingId) {
      // Keep existing image if editing and no new image uploaded
      const existingStaff = staffMembers.find(staff => staff.id === editingId);
      imageData = existingStaff?.image || '';
    }

    if (isEditing && editingId) {
      // Update existing staff
      setStaffMembers(staffMembers.map(staff =>
        staff.id === editingId ? {
          ...newStaff,
          id: editingId,
          image: imageData
        } : staff
      ));
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Add new staff
      const staffToAdd = {
        ...newStaff,
        id: Date.now(),
        image: imageData || '/assets/user.jpg'
      };

      setStaffMembers([...staffMembers, staffToAdd]);
    }

    // Reset form and close
    setNewStaff({
      name: '',
      designation: '',
      education: '',
      experience: '',
      image: null,
      imagePreview: '',
      isFeatured: false
    });
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (staff) => {
    setNewStaff({
      ...staff,
      imagePreview: staff.image,
      image: null
    });
    setIsEditing(true);
    setEditingId(staff.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
    setNewStaff({
      name: '',
      designation: '',
      education: '',
      experience: '',
      image: null,
      imagePreview: '',
      isFeatured: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFeatured = (id) => {
    setStaffMembers(staffMembers.map(staff =>
      staff.id === id ? { ...staff, isFeatured: !staff.isFeatured } : staff
    ));
  };

  const handleDeleteClick = (id) => {
    const staff = staffMembers.find(s => s.id === id);
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== staffToDelete.id));
      if (editingId === staffToDelete.id) {
        handleCancelEdit();
      }
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const handleStarClick = (e, id) => {
    e.stopPropagation(); // Prevent card click events
    toggleFeatured(id);
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 md:py-16 lg:py-12 px-4">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
            onClick={cancelDelete}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    title="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="mb-6">
                  
                 

                  <p className="text-gray-700">
                    Are you sure you want to delete <span className="font-semibold">{staffToDelete.name}</span>
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header with Add Button */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Non-Teaching Staff <span className="font-bold text-gray-700">({staffMembers.length})</span>
              </h1>
              <p className="text-gray-600 mt-2 pl-1 max-w-xl text-sm">
                Manage administrative, technical, and support staff members.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              {isEditing && showForm ? (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Editing Mode
                  </span>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-400/30 text-blue-950 rounded-3xl font-medium transition duration-200 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Staff
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Right Side Form Drawer with Slide-in Animation */}
        {showForm && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={handleCancelEdit}
            />

            {/* Form Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:max-w-lg">
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {isEditing ? 'Edit Staff Member' : 'Add New Staff'}
                    </h2>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      title="Close"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload - Clickable upload area */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Staff Photo
                        </label>
                        
                        {/* Image Tips - i icon */}
                        <div className="relative flex group">
                          <button
                            type="button"
                            className=" text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"
                            aria-label="Image tips"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute left-5 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-800 mb-1">Image Tips</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Use square images (1:1 aspect ratio)</li>
                                  <li>• Recommended size: 500x500 pixels</li>
                                  <li>• Supported formats: JPG, PNG, JPEG</li>
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

                      {/* Clickable Image Container */}
                      <div
                        className="mb-4 relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {newStaff.imagePreview ? (
                          <div className="relative aspect-square w-52 h-52 max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                            <img
                              src={newStaff.imagePreview}
                              alt="Preview"
                              className="w-52 h-52 object-cover"
                            />
                            
                            {/* Remove Button - Top Right Corner */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                              className="absolute top-2 right-2  transition duration-200"
                              title="Remove image"
                            >
                             <Trash2 className='w-6 h-6 p-1 bg-red-600 text-white rounded-2xl' />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-square w-52 h-52 max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                            <div className="mb-4 relative">
                              <svg className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 group-hover:text-blue-700 transition-colors text-center">Click to upload image</p>
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

                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={newStaff.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg "
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Designation Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="designation"
                          value={newStaff.designation}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg "
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Education Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Education *
                      </label>
                      <div className="relative">
                        <textarea
                          name="education"
                          value={newStaff.education}
                          onChange={handleInputChange}
                          required
                          rows="1"
                          placeholder="e.g., MBA, B.Sc., Diploma"
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg "
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                    </div>

                    {/* Experience Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="experience"
                          value={newStaff.experience}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., 5 years"
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg "
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-medium hover:bg-blue-400/50 transition duration-200"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-medium hover:bg-blue-400/50 transition duration-200 flex items-center justify-center"
                          >
                            
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className={showForm ? "lg:mr-0" : ""}>
          {/* Staff Cards Grid */}
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-2 
                          sm:grid-cols-2 
                          lg:grid-cols-4 
                          mb-16">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden md:w-60 flex flex-col hover:shadow-lg transition-all duration-300 relative group"
                onMouseEnter={() => setHoveredCard(staff.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Container with Interactive Star */}
                <div className="h-40 md:h-56  w-full overflow-hidden relative">
                  <img
                    src={staff.image}
                    alt={staff.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Interactive Star - Always visible for featured, visible on hover for non-featured */}
                  <div
                    className={`absolute top-3 right-3 z-10 cursor-pointer transition-all duration-200 ${staff.isFeatured
                        ? 'opacity-100 scale-100'
                        : hoveredCard === staff.id
                          ? 'opacity-100 scale-100'
                          : 'opacity-40 scale-90'
                      }`}
                    onClick={(e) => handleStarClick(e, staff.id)}
                    title={staff.isFeatured ? "Click to remove from featured" : "Click to mark as featured"}
                  >
                    <svg
                      className={`w-7 h-7 p-1 rounded-2xl drop-shadow-lg transition-colors duration-200 ${staff.isFeatured
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-white/80 hover:bg-white text-black group-hover:bg-white'
                        }`}
                      fill={staff.isFeatured ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-xs sm:text-lg h-8 sm:h-12 font-semibold leading-snug">
                    {staff.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{staff.designation || 'Not specified'}</p>

                  {/* Education and Experience Section */}
                  <div className="mt-3 text-xs text-gray-700 space-y-1">
                    <p className="flex items-center">
                      <span className="mr-2">🎓</span>
                      <span>{staff.education || 'Education not specified'}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="flex items-center">
                        <span className="mr-2">💼</span>
                        <span>{staff.experience || 'Experience not specified'}</span>
                      </p>
                      
                      {/* Edit and Delete Buttons - Aligned with experience */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-1.5 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl transition duration-200 flex items-center justify-center"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(staff.id)}
                          className="p-1.5 text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl transition duration-200 flex items-center justify-center"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonTeachingStaffDashboard;