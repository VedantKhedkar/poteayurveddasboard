import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Upload, Save, XCircle, Info } from 'lucide-react';


const ActivityFlyer = () => {
  // --- State ---
  const [activeYear, setActiveYear] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flyerToDelete, setFlyerToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [flyerData, setFlyerData] = useState({
    title: '',
    date: '',
    year: '2025',
    imageUrl: '',
    imagePreview: '',
    imageFile: null
  });

  // --- Initial Data ---
  const initialFlyersByYear = {
    "2025": [
      {
        id: 1,
        title: "Orientation Program",
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop",
        date: "January 15, 2025",
      },
      {
        id: 2,
        title: "Teachers Day",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w-800&auto=format&fit=crop",
        date: "September 5, 2025",
      },
    ],
    "2024": [
      {
        id: 7,
        title: "Annual Sports Day",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
        date: "February 20, 2024",
      },
    ],
    "2023": [
      {
        id: 10,
        title: "Graduation Ceremony",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w-800&auto=format&fit=crop",
        date: "May 30, 2023",
      },
    ],
  };

  const [flyersByYear, setFlyersByYear] = useState(() => {
    const saved = localStorage.getItem('activityFlyers');
    return saved ? JSON.parse(saved) : initialFlyersByYear;
  });

  useEffect(() => {
    localStorage.setItem('activityFlyers', JSON.stringify(flyersByYear));
  }, [flyersByYear]);

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
          <p className="text-sm font-medium text-gray-800 mb-1">Image Tips</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use square images (1:1 aspect ratio)</li>
            <li>• Recommended size: 500x500 pixels</li>
            <li>• Supported formats: JPG,JPEG,PNG</li>
            <li>• Max file size: 5MB</li>
            <li>• For best quality, use high-resolution images</li>
          </ul>
        </div>
      </div>
      {/* Tooltip arrow */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
    </div>
  );

  // --- Logic Helpers ---
  const getAllFlyers = () => {
    const allFlyers = [];
    tabOrder.slice(1).forEach(year => {
      if (flyersByYear[year]) {
        allFlyers.push(...flyersByYear[year].map(flyer => ({
          ...flyer,
          year: year
        })));
      }
    });
    return allFlyers.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getCurrentFlyers = () => {
    if (activeYear === "All") return getAllFlyers();
    return flyersByYear[activeYear] || [];
  };

  const currentFlyers = getCurrentFlyers();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlyerData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerData(prev => ({
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
    setFlyerData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: '',
      imageUrl: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flyerData.title.trim() || !flyerData.date) {
      alert('Please fill in all required fields');
      return;
    }

    const yearForFlyer = editingId 
      ? (() => {
          for (const year in flyersByYear) {
            if (flyersByYear[year].find(f => f.id === editingId)) return year;
          }
          return activeYear !== "All" ? activeYear : '2025';
        })()
      : (activeYear !== "All" ? activeYear : '2025');

    const newFlyer = {
      id: editingId || Date.now(),
      title: flyerData.title.trim(),
      date: formatDateForDisplay(flyerData.date),
      imageUrl: flyerData.imageUrl || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop',
    };

    setFlyersByYear(prev => {
      const updated = { ...prev };
      if (editingId) {
        Object.keys(updated).forEach(year => {
          updated[year] = updated[year].filter(flyer => flyer.id !== editingId);
        });
      }
      updated[yearForFlyer] = [...(updated[yearForFlyer] || []), newFlyer];
      return updated;
    });

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFlyerData({
      title: '',
      date: '',
      year: '2025',
      imageUrl: '',
      imagePreview: '',
      imageFile: null
    });
    setEditingId(null);
  };

  const handleEdit = (flyer) => {
    setFlyerData({
      title: flyer.title,
      date: formatDateForInput(flyer.date),
      year: flyer.year || (activeYear !== "All" ? activeYear : '2025'),
      imageUrl: flyer.imageUrl,
      imagePreview: flyer.imageUrl
    });
    setEditingId(flyer.id);
    setShowForm(true);
  };

  const confirmDelete = (flyer) => {
    setFlyerToDelete(flyer);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!flyerToDelete) return;
    setFlyersByYear(prev => ({
      ...prev,
      [flyerToDelete.year]: prev[flyerToDelete.year].filter(flyer => flyer.id !== flyerToDelete.id)
    }));
    setShowDeleteModal(false);
    setFlyerToDelete(null);
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
    return tabOrder.slice(1).reduce((total, year) => total + (flyersByYear[year]?.length || 0), 0);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 tracking-wider">Activity Flyer</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center space-x-2 bg-blue-400/30 text-blue-950 font-medium px-6 py-3 rounded-3xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] self-start"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Year Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabOrder.map((tab) => {
            const count = tab === "All" ? getAllTabCount() : (flyersByYear[tab]?.length || 0);
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
      {currentFlyers.length > 0 ? (
        <section className="grid justify-items-center grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentFlyers.map((flyer) => (
            <div key={flyer.id} className="flex flex-col border w-64 h-80 border-gray-200 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video w-full h-52 overflow-hidden bg-gray-100">
                <img src={flyer.imageUrl} alt={flyer.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 bg-white flex-1 flex flex-col">
                <p className="text-sm font-bold text-gray-800 mb-3 line-clamp-2 flex-1">{flyer.title}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="text-xs font-semibold">{flyer.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(flyer)} className="p-1.5 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(flyer)} className="p-1.5 text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No activity flyers available</h3>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-3 bg-blue-400/30 text-blue-950 rounded-lg font-semibold mt-4">Add New</button>
        </div>
      )}

      {/* Form Side Panel */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all ${showForm ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${showForm ? 'opacity-50' : 'opacity-0'}`} onClick={() => setShowForm(false)} />
        <div className={`absolute inset-y-0 right-0 flex max-w-full transition-transform duration-300 ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="relative w-screen sm:max-w-lg h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-700">{editingId ? 'Edit' : 'Add New'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" name="title" value={flyerData.title} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                  <input type="date" name="date" value={flyerData.date} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600" />
                      <InstructionTooltip />
                    </div>
                  </div>
                  {!flyerData.imagePreview ? (
                    <div className="border-2 flex justify-center items-center w-72 h-64 mx-auto border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-up" />
                      <label htmlFor="img-up" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-blue-600 font-medium">Click to upload</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={flyerData.imagePreview} alt="Preview" className="w-72 h-64 mx-auto object-cover rounded-lg" />
                      <button type="button" onClick={removeImage} className="absolute  top-2 right-48 transform translate-x-24  p-2 text-white bg-red-600 rounded-2xl "><Trash2 className="w-4 h-4" /> </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border font-medium rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-400/30 text-blue-950 font-medium rounded-lg flex items-center justify-center gap-2">
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
            <h3 className="text-lg font-bold mb-2">Delete Flyer?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{flyerToDelete?.title}"?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFlyer;