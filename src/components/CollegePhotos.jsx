import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Upload, Save, XCircle, Info } from 'lucide-react';

const CollegePhotos = () => {
  // --- State ---
  const [activeYear, setActiveYear] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [photoData, setPhotoData] = useState({
    title: '',
    date: '',
    year: '2025',
    imageUrl: '',
    imagePreview: '',
    imageFile: null
  });

  // --- Initial Data ---
  const initialPhotosByYear = {
    "2025": [
      {
        id: 1,
        title: "Campus Spring Festival",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop",
        date: "March 15, 2025",
      },
      {
        id: 2,
        title: "Library Opening Ceremony",
        imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format&fit=crop",
        date: "January 20, 2025",
      },
    ],
    "2024": [
      {
        id: 3,
        title: "Annual Convocation",
        imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop",
        date: "June 10, 2024",
      },
      {
        id: 4,
        title: "Science Fair Exhibition",
        imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop",
        date: "October 5, 2024",
      },
    ],
    "2023": [
      {
        id: 5,
        title: "College Anniversary Celebration",
        imageUrl: "https://images.unsplash.com/photo-1541336032412-2048a678540d?w=800&auto=format&fit=crop",
        date: "November 20, 2023",
      },
      {
        id: 6,
        title: "Sports Championship",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
        date: "February 15, 2023",
      },
    ],
  };

  const [photosByYear, setPhotosByYear] = useState(() => {
    const saved = localStorage.getItem('collegePhotos');
    return saved ? JSON.parse(saved) : initialPhotosByYear;
  });

  useEffect(() => {
    localStorage.setItem('collegePhotos', JSON.stringify(photosByYear));
  }, [photosByYear]);

  const tabOrder = ["All", "2025", "2024", "2023"];

  // --- Tooltip Component ---
  const InstructionTooltip = () => (
    <div className="absolute left-0 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-800 mb-1">Photo Tips</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use landscape or portrait images</li>
            <li>• Recommended size: 800x600 pixels or larger</li>
            <li>• Supported formats: JPG, JPEG, PNG</li>
            <li>• Max file size: 10MB</li>
            <li>• For best quality, use high-resolution images</li>
          </ul>
        </div>
      </div>
      {/* Tooltip arrow */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
    </div>
  );

  // --- Logic Helpers ---
  const getAllPhotos = () => {
    const allPhotos = [];
    tabOrder.slice(1).forEach(year => {
      if (photosByYear[year]) {
        allPhotos.push(...photosByYear[year].map(photo => ({
          ...photo,
          year: year
        })));
      }
    });
    return allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getCurrentPhotos = () => {
    if (activeYear === "All") return getAllPhotos();
    return photosByYear[activeYear] || [];
  };

  const currentPhotos = getCurrentPhotos();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPhotoData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPhotoData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: '',
      imageUrl: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photoData.title.trim() || !photoData.date) {
      alert('Please fill in all required fields');
      return;
    }

    const yearForPhoto = editingId 
      ? (() => {
          for (const year in photosByYear) {
            if (photosByYear[year].find(p => p.id === editingId)) return year;
          }
          return activeYear !== "All" ? activeYear : '2025';
        })()
      : (activeYear !== "All" ? activeYear : '2025');

    const newPhoto = {
      id: editingId || Date.now(),
      title: photoData.title.trim(),
      date: formatDateForDisplay(photoData.date),
      imageUrl: photoData.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
    };

    setPhotosByYear(prev => {
      const updated = { ...prev };
      if (editingId) {
        Object.keys(updated).forEach(year => {
          updated[year] = updated[year].filter(photo => photo.id !== editingId);
        });
      }
      updated[yearForPhoto] = [...(updated[yearForPhoto] || []), newPhoto];
      return updated;
    });

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setPhotoData({
      title: '',
      date: '',
      year: '2025',
      imageUrl: '',
      imagePreview: '',
      imageFile: null
    });
    setEditingId(null);
  };

  const handleEdit = (photo) => {
    setPhotoData({
      title: photo.title,
      date: formatDateForInput(photo.date),
      year: photo.year || (activeYear !== "All" ? activeYear : '2025'),
      imageUrl: photo.imageUrl,
      imagePreview: photo.imageUrl
    });
    setEditingId(photo.id);
    setShowForm(true);
  };

  const confirmDelete = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!photoToDelete) return;
    setPhotosByYear(prev => ({
      ...prev,
      [photoToDelete.year]: prev[photoToDelete.year].filter(photo => photo.id !== photoToDelete.id)
    }));
    setShowDeleteModal(false);
    setPhotoToDelete(null);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAllTabCount = () => {
    return tabOrder.slice(1).reduce((total, year) => total + (photosByYear[year]?.length || 0), 0);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 tracking-wider">College Photos</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center space-x-2 bg-blue-400/30 text-blue-950  font-medium px-6 py-3 rounded-3xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] self-start"
          >
            <Plus className="w-5 h-5" />
            <span>Add New </span>
          </button>
        </div>

        {/* Year Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabOrder.map((tab) => {
            const count = tab === "All" ? getAllTabCount() : (photosByYear[tab]?.length || 0);
            const isEmpty = count === 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveYear(tab)}
                className={`px-6 md:px-8 py-2 text-sm my-1 rounded-3xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${activeYear === tab ? "bg-blue-400/30 text-blue-950 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} ${isEmpty ? 'opacity-70' : ''}`}
                disabled={isEmpty && tab !== "All"}
              >
                {tab} {isEmpty && tab !== "All" && <span className="ml-2 text-xs opacity-75">(Empty)</span>}
              </button>
            );
          })}
        </div>
      </header>

      {/* Grid */}
      {currentPhotos.length > 0 ? (
        <section className="grid justify-items-center grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentPhotos.map((photo) => (
            <div key={photo.id} className="flex flex-col border w-64 h-80 border-gray-200 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video w-full h-52 overflow-hidden bg-gray-100">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 bg-white flex-1 flex flex-col">
                <p className="text-sm font-bold text-gray-800 mb-3 line-clamp-2 flex-1">{photo.title}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-xs font-semibold">{photo.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(photo)} className="p-1.5 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(photo)} className="p-1.5 text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No college photos available</h3>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }} 
            className="px-6 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-medium mt-4"
          >
            Add First Photo
          </button>
        </div>
      )}

      {/* Form Side Panel */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all ${showForm ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${showForm ? 'opacity-50' : 'opacity-0'}`} onClick={() => setShowForm(false)} />
        <div className={`absolute inset-y-0 right-0 flex max-w-full transition-transform duration-300 ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="relative w-screen sm:max-w-lg h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-700">{editingId ? 'Edit Photo' : 'Add New Photo'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={photoData.title} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Graduation Ceremony 2024"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={photoData.date} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">Photo Image</label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600" />
                      <InstructionTooltip />
                    </div>
                  </div>
                  {!photoData.imagePreview ? (
                    <div className="border-2 flex justify-center items-center w-72 h-64 mx-auto border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-up" />
                      <label htmlFor="img-up" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-blue-600 font-medium">Click to upload photo</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={photoData.imagePreview} alt="Preview" className="w-72 h-64 mx-auto object-cover rounded-lg" />
                      <button 
                        type="button" 
                        onClick={removeImage} 
                        className="absolute top-2 right-48 transform translate-x-24 p-2 text-white bg-red-600 rounded-2xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 py-3 border font-medium rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-400/30 text-blue-950 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-blue-400/40"
                >
                  
                  {editingId ? 'Save Changes' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Delete Photo?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{photoToDelete?.title}"?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegePhotos;