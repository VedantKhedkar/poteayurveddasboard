// components/ArchitecturalGallery.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Trash2, Plus, X, Edit2, Info, AlertTriangle } from 'lucide-react';

const ArchitecturalGallery = () => {
  // --- States ---
  const [formData, setFormData] = useState({ title: '', date: new Date().toISOString().split('T')[0] });
  const [images, setImages] = useState({ main: null, additional: [null, null, null, null] });
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeYear, setActiveYear] = useState("All");
  const [isMobile, setIsMobile] = useState(false);

  // Delete Section State
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, projectId: null, year: null });

  const mainFileInputRef = useRef(null);
  const additionalFileInputRefs = useRef([]);

  const [galleryByYear, setGalleryByYear] = useState({
    "2025": [
      { id: 101, title: "Skyline Corporate Plaza", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500", additionalImages: ["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500"], date: "2025-01-15", year: "2025" },
      { id: 102, title: "Urban Loft Apartments", imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=500", additionalImages: ["https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=500"], date: "2025-02-20", year: "2025" },
      { id: 103, title: "Modern Museum Design", imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=500", additionalImages: ["https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=500"], date: "2025-03-10", year: "2025" },
      { id: 104, title: "Lakeside Villa", imageUrl: "https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=500", additionalImages: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=500"], date: "2025-04-05", year: "2025" }
    ],
    "2024": [
      { id: 201, title: "City Center Mall", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500", additionalImages: ["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500"], date: "2024-06-15", year: "2024" }
    ]
  });

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const years = Object.keys(galleryByYear).sort((a, b) => b - a);
  const tabOrder = ["All", ...years];

  // --- Handlers ---
  const handleImageChange = (e, type, index = null) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      if (type === 'main') {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => ({ ...prev, main: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        // Handle multiple additional images
        const fileArray = Array.from(files);
        const currentImages = [...images.additional.filter(img => img !== null)];

        fileArray.forEach((file, i) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            currentImages.push(reader.result);

            // Update state after processing all files
            if (i === fileArray.length - 1) {
              // Pad with null to maintain minimum 4 slots
              const paddedImages = [...currentImages];
              while (paddedImages.length < 4) {
                paddedImages.push(null);
              }
              setImages(prev => ({ ...prev, additional: paddedImages }));
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeImage = (type, index = null) => {
    if (type === 'main') {
      setImages(prev => ({ ...prev, main: null }));
    } else {
      const newAdditional = [...images.additional];
      newAdditional[index] = null;

      // Remove trailing empty slots (keep at least 4 slots, but remove extra empty ones at the end)
      let lastNonEmptyIndex = -1;
      for (let i = newAdditional.length - 1; i >= 0; i--) {
        if (newAdditional[i] !== null) {
          lastNonEmptyIndex = i;
          break;
        }
      }

      // Keep minimum 4 slots, but remove extra empty slots at the end
      const minSlots = 4;
      const maxIndexToKeep = Math.max(lastNonEmptyIndex + 1, minSlots);
      const trimmedAdditional = newAdditional.slice(0, maxIndexToKeep);

      // Ensure we have at least minSlots
      while (trimmedAdditional.length < minSlots) {
        trimmedAdditional.push(null);
      }

      setImages(prev => ({ ...prev, additional: trimmedAdditional }));
    }
  };

  const addMoreImageSlot = () => {
    setImages(prev => ({
      ...prev,
      additional: [...prev.additional, null]
    }));
  };

  const resetForm = () => {
    setIsAddingProject(false);
    setEditingId(null);
    setImages({ main: null, additional: [null, null, null, null] });
    setFormData({ title: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      date: project.date.includes('-') ? project.date : new Date(project.date).toISOString().split('T')[0]
    });

    // Load existing additional images, ensure at least 4 slots
    const additionalSlots = [...project.additionalImages];
    while (additionalSlots.length < 4) {
      additionalSlots.push(null);
    }

    setImages({
      main: project.imageUrl || "https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=500",
      additional: additionalSlots
    });
    setIsAddingProject(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!images.main) return alert("Main image is required");
    const selectedDate = new Date(formData.date);
    const extractedYear = selectedDate.getFullYear().toString();
    const projectData = {
      id: editingId || Date.now(),
      title: formData.title,
      imageUrl: images.main,
      additionalImages: images.additional.filter(img => img !== null),
      date: formData.date,
      year: extractedYear
    };
    setGalleryByYear(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(y => {
        newState[y] = newState[y].filter(p => p.id !== projectData.id);
      });
      if (!newState[extractedYear]) newState[extractedYear] = [];
      newState[extractedYear] = [...newState[extractedYear], projectData];
      return newState;
    });
    resetForm();
  };

  const executeDelete = () => {
    setGalleryByYear(prev => ({
      ...prev,
      [deleteConfirmation.year]: prev[deleteConfirmation.year].filter(p => p.id !== deleteConfirmation.projectId)
    }));
    setDeleteConfirmation({ isOpen: false, projectId: null, year: null });
  };

  const InstructionTooltip = () => (
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
            <li>• Supported formats: JPG,JPEG,PNG</li>
            <li>• Max file size: 5MB</li>
            <li>• For best quality, use high-resolution images</li>
          </ul>
        </div>
      </div>
      {/* Tooltip arrow - centered */}
      <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 px-2 py-3 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-base font-bold text-gray-800">Architectural Gallery</h1>
          </div>
          <button
            onClick={() => setIsAddingProject(true)}
            className="flex items-center gap-1.5 bg-blue-400/30 text-blue-950 px-3 py-2 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 hover:shadow-md"
            aria-label="Add new project"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">Add Project</span>
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                  Architectural Gallery
                </h1>
              </div>
              <button
                onClick={() => setIsAddingProject(true)}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-blue-400/30 text-blue-950 font-semibold rounded-3xl transition-all transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Add New</span>
              </button>
            </div>
          </header>
        )}

        {/* Year Filter Section */}
        <div className="mb-6">
          <div className="max-w-7xl mx-auto pt-2">
            <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
              {tabOrder.map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-4 sm:px-6 py-2 md:px-6 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeYear === year
                    ? "bg-blue-400/30 text-blue-950 shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="justify-items-center sm:justify-items-start">
          {(activeYear === "All" ? Object.values(galleryByYear).flat() : galleryByYear[activeYear] || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {(activeYear === "All" ? Object.values(galleryByYear).flat() : galleryByYear[activeYear] || []).map(work => (
                <div
                  key={work.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-64 h-full flex flex-col group cursor-pointer"
                  onClick={() => handleEdit(work)}
                >
                  <div className="relative overflow-hidden pt-[70%] w-full">
                    <img
                      src={work.imageUrl}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={work.title}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2">
                      {work.title}
                    </h3>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-3 text-orange-500" />
                        <span className="text-xs font-medium">
                          {new Date(work.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-gray-500">Gallery Images</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(work);
                            }}
                            className="bg-blue-200 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
                            aria-label="Edit project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmation({ isOpen: true, projectId: work.id, year: work.year });
                            }}
                            className="bg-red-200 text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                            aria-label="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No projects found for {activeYear === "All" ? "any year" : activeYear}
              </h3>
              <p className="text-gray-500">
                {activeYear === "All"
                  ? "Create your first architectural project!"
                  : "Check other years or create a new project for this year."}
              </p>
              <button
                onClick={() => setIsAddingProject(true)}
                className="mt-4 flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-teal-400 text-white font-medium rounded-3xl hover:from-orange-500 hover:to-teal-500 transition-all transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Add New</span>
              </button>
            </div>
          )}
        </div>

        {/* --- DELETE CONFIRMATION SECTION --- */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                  <AlertTriangle className="text-red-500 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setDeleteConfirmation({ isOpen: false })} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors">No, Keep it</button>
                <button onClick={executeDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Slide-out Form Panel */}
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${isAddingProject ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${isAddingProject ? 'opacity-50' : 'opacity-0'}`}
            onClick={resetForm}
          />

          {/* Form Panel */}
          <div className={`absolute inset-y-0 right-0 flex w-96 transition-transform duration-300 ease-in-out ${isAddingProject ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`relative ${isMobile ? 'w-screen' : 'w-screen max-w-lg'}`}>
              <div className="flex flex-col h-full bg-white shadow-xl">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b ">
                  <h2 className="text-lg font-bold text-gray-800">
                    {editingId ? 'Edit ' : 'Add New '}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Project Information Form */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Title *</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border rounded-xl text-sm"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Skyline Corporate Plaza"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Date *</label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 border rounded-xl text-sm bg-white"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Project Images Section */}
                    <div className="space-y-8">
                      {/* Main Cover Image Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-gray-700">Main Image *</label>
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <InstructionTooltip />
                            </div>
                          </div>

                        </div>
                        <div className="relative">
                          <div
                            className={`w-full h-64 border-2 ${images.main ? 'border-solid' : 'border-dashed'} rounded-2xl relative flex items-center justify-center bg-gray-50 ${images.main ? 'border-gray-300' : 'border-gray-200'}`}
                          >
                            {images.main ? (
                              <>
                                <img
                                  src={images.main}
                                  className="w-full h-full object-cover rounded-2xl"
                                  alt="Main cover"
                                />
                                {/* Remove button on top-right corner */}
                                <button
                                  type="button"
                                  onClick={() => removeImage('main')}
                                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                  aria-label="Remove main image"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => mainFileInputRef.current.click()}
                                className="flex flex-col items-center gap-2"
                              >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Plus className="w-6 h-6 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Upload Main Image</span>
                                <span className="text-xs text-gray-400">Click to browse</span>
                              </button>
                            )}
                            <input
                              type="file"
                              hidden
                              ref={mainFileInputRef}
                              onChange={(e) => handleImageChange(e, 'main')}
                              accept="image/*"
                            />
                          </div>
                         
                        </div>
                      </div>

                      {/* Additional Images Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-gray-700">Gallery Images</label>
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <InstructionTooltip />
                            </div>
                          </div>

                        </div>

                        {/* Single Upload Area for Multiple Images */}
                        <div className="relative">
                          <div
                            className={`w-full min-h-[120px] border-2 border-dashed rounded-2xl relative flex flex-col items-center justify-center p-6 ${images.additional.filter(img => img !== null).length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                          >
                            {/* Upload Button or Gallery Preview */}
                            {images.additional.filter(img => img !== null).length === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const files = Array.from(e.target.files);
                                    const newAdditional = [...images.additional];
                                    let nextIndex = 0;

                                    files.forEach((file, index) => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const emptyIndex = newAdditional.findIndex(img => img === null);
                                        if (emptyIndex !== -1) {
                                          newAdditional[emptyIndex] = reader.result;
                                        } else {
                                          newAdditional.push(reader.result);
                                        }

                                        if (index === files.length - 1) {
                                          const paddedAdditional = [...newAdditional];
                                          while (paddedAdditional.length < 4) {
                                            paddedAdditional.push(null);
                                          }
                                          setImages(prev => ({ ...prev, additional: paddedAdditional }));
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  };
                                  input.click();
                                }}
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Plus className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium text-gray-700 block mb-1">Click to upload gallery images</span>

                                </div>
                              </button>
                            ) : (
                              <>
                                {/* Gallery Preview */}
                                <div className="w-full">
                                  {/* Image Thumbnails Grid */}
                                  <div className="grid grid-cols-4 gap-3">
                                    {images.additional.filter(img => img !== null).map((img, index) => (
                                      <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                          <img
                                            src={img}
                                            className="w-full h-full object-cover"
                                            alt={`Gallery image ${index + 1}`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeImage('additional', images.additional.indexOf(img))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10 "
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Standalone Add More Button */}
                                    {images.additional.filter(img => img !== null).length > 0 && (
                                      <div className="flex items-center justify-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.multiple = true;
                                            input.accept = 'image/*';
                                            input.onchange = (e) => {
                                              const files = Array.from(e.target.files);
                                              const currentImages = [...images.additional.filter(img => img !== null)];

                                              files.forEach((file, fileIndex) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  currentImages.push(reader.result);

                                                  if (fileIndex === files.length - 1) {
                                                    const paddedImages = [...currentImages];
                                                    while (paddedImages.length < 4) {
                                                      paddedImages.push(null);
                                                    }
                                                    setImages(prev => ({ ...prev, additional: paddedImages }));
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              });
                                            };
                                            input.click();
                                          }}
                                          className="w-14 h-14 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors group"
                                        >
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-2">
                                            <Plus className="w-5 h-5 text-blue-500" />
                                          </div>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 bg-gray-100 text-gray-700 h-12 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-400/30 text-blue-950 h-12 rounded-xl font-medium shadow-md hover:bg-blue-400/50 transition-colors"
                      >
                        {editingId ? 'Save Changes' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturalGallery;