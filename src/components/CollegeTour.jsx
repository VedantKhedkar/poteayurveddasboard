import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, MapPin, Info, Plus, X, AlertTriangle, Trash2, Link } from 'lucide-react';
import { motion } from 'framer-motion';

// Instruction Tooltip Component
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

const EventCard = ({ event, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-64 h-full flex flex-col group">
      {/* Event Image with Cover Badge */}
      <div className="relative overflow-hidden pt-[70%] w-full">
        <img
          src={event.images[event.coverImageIndex] || 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600'}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Event Details */}
      <div className="pt-6 pl-6 pr-6 flex-1  flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-xs mb-4 line-clamp-2 flex-1">
          {event.description}
        </p>

        {/* Event Info Icons */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-3 text-orange-500" />
            <span className="text-xs font-medium">
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-3 text-red-500" />
            <span className="text-xs font-medium truncate">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Positioned at bottom right corner */}
      <div className="p-2 pt-0 flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
          className="bg-blue-200 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md"
          aria-label="Edit tour"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
          className="bg-red-200 text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
          aria-label="Delete tour"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const CollegeTourDashboard = () => {
  const [tours, setTours] = useState([
    {
      id: 1,
      title: "Campus Main Tour",
      description: "A comprehensive tour of the main campus facilities including library, student center, and lecture halls.",
      location: "Main Campus",
      date: "2023-10-15",
      images: [
        "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600"
      ],
      videos: [
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "https://www.youtube.com/embed/9bZkp7q19f0"
      ],
      coverImageIndex: 0
    },
    {
      id: 2,
      title: "Engineering Department Tour",
      description: "Explore our state-of-the-art engineering labs and research facilities with guided demonstrations.",
      location: "Engineering Building",
      date: "2023-10-20",
      images: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600"
      ],
      videos: [
        "https://www.youtube.com/embed/L_jWHffIx5E"
      ],
      coverImageIndex: 0
    },
    {
      id: 3,
      title: "Library Tour",
      description: "Explore our state-of-the-art engineering labs and research facilities with guided demonstrations.",
      location: "Engineering Building",
      date: "2023-10-20",
      images: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600"
      ],
      videos: [],
      coverImageIndex: 0
    },
    {
      id: 4,
      title: "Sports Complex Tour",
      description: "Explore our state-of-the-art engineering labs and research facilities with guided demonstrations.",
      location: "Engineering Building",
      date: "2023-10-20",
      images: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600"
      ],
      videos: [],
      coverImageIndex: 0
    }
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    images: [],
    videos: [],
    coverImageIndex: 0
  });

  // Image state
  const [formImages, setFormImages] = useState({ main: null, additional: [null, null, null, null] });
  const [formVideos, setFormVideos] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, tourId: null });
  const [newVideoLink, setNewVideoLink] = useState("");

  // Refs for file inputs
  const mainFileInputRef = useRef(null);
  const additionalFileInputRefs = useRef([]);

  const [isMobile, setIsMobile] = useState(false);

  // Extract available years
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    tours.forEach(tour => {
      if (tour.date) {
        const year = new Date(tour.date).getFullYear().toString();
        yearsSet.add(year);
      }
    });
    const years = Array.from(yearsSet).sort((a, b) => b - a);
    return ["all", ...years];
  }, [tours]);

  // Filter events based on active tab
  const filteredTours = useMemo(() => {
    if (activeTab === "all") return tours;
    return tours.filter(tour => {
      const tourYear = new Date(tour.date).getFullYear().toString();
      return tourYear === activeTab;
    });
  }, [tours, activeTab]);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load tours from localStorage on mount
  useEffect(() => {
    const savedTours = localStorage.getItem('collegeTours');
    if (savedTours) {
      setTours(JSON.parse(savedTours));
    }
  }, []);

  // Save tours to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('collegeTours', JSON.stringify(tours));
  }, [tours]);

  // --- IMAGE HANDLERS ---
  const handleImageChange = (e, type, index = null) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      if (type === 'main') {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormImages(prev => ({ ...prev, main: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        // Handle multiple additional images
        const fileArray = Array.from(files);
        const currentImages = [...formImages.additional.filter(img => img !== null)];

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
              setFormImages(prev => ({ ...prev, additional: paddedImages }));
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeImage = (type, index = null) => {
    if (type === 'main') {
      setFormImages(prev => ({ ...prev, main: null }));
    } else {
      const newAdditional = [...formImages.additional];
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

      setFormImages(prev => ({ ...prev, additional: trimmedAdditional }));
    }
  };

  const addMoreImageSlot = () => {
    setFormImages(prev => ({
      ...prev,
      additional: [...prev.additional, null]
    }));
  };

  const resetImageForm = () => {
    setFormImages({ main: null, additional: [null, null, null, null] });
  };

  // --- VIDEO LINK HANDLERS ---
  const handleAddVideoLink = () => {
    if (!newVideoLink.trim()) {
      alert("Please enter a video link");
      return;
    }

    // Validate the URL
    try {
      const url = new URL(newVideoLink);

      // Check if it's a valid video URL (YouTube, Vimeo, etc.)
      if (!url.protocol.startsWith('http')) {
        alert("Please enter a valid HTTP/HTTPS URL");
        return;
      }

      // Check if URL already exists
      if (formVideos.includes(newVideoLink.trim())) {
        alert("This video link is already added");
        return;
      }

      setFormVideos(prev => [...prev, newVideoLink.trim()]);
      setNewVideoLink("");
    } catch (error) {
      alert("Please enter a valid URL");
    }
  };

  const removeVideo = (index) => {
    setFormVideos(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllVideos = () => {
    setFormVideos([]);
  };

  // Function to extract video ID and platform from URL
  const getVideoInfo = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // YouTube
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('embed/')[1]?.split('?')[0];
        }

        return {
          platform: 'YouTube',
          id: videoId,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
          embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : url
        };
      }

      // Vimeo
      if (hostname.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return {
          platform: 'Vimeo',
          id: videoId,
          thumbnail: null,
          embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : url
        };
      }

      // Generic video URL
      return {
        platform: 'Video',
        id: null,
        thumbnail: null,
        embedUrl: url
      };
    } catch (error) {
      return {
        platform: 'Unknown',
        id: null,
        thumbnail: null,
        embedUrl: url
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTour({
      ...newTour,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newTour.title || !newTour.description || !newTour.location || !newTour.date) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formImages.main) {
      alert("Main image is required");
      return;
    }

    // Combine main and additional images
    const allImages = [formImages.main, ...formImages.additional.filter(img => img !== null)];

    const tourData = {
      ...newTour,
      images: allImages,
      videos: formVideos,
      coverImageIndex: 0
    };

    if (editingId !== null) {
      // Update existing tour
      const updatedTours = tours.map(tour =>
        tour.id === editingId
          ? { ...tourData, id: editingId }
          : tour
      );
      setTours(updatedTours);
      setEditingId(null);
    } else {
      // Add new tour
      const newTourWithId = {
        ...tourData,
        id: tours.length > 0 ? Math.max(...tours.map(t => t.id)) + 1 : 1
      };
      const updatedTours = [...tours, newTourWithId];
      setTours(updatedTours);
    }

    // Reset form and close drawer
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setNewTour({
      title: "",
      description: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
      images: [],
      videos: [],
      coverImageIndex: 0
    });
    resetImageForm();
    setFormVideos([]);
    setNewVideoLink("");
    setEditingId(null);
  };

  const handleEdit = (tour) => {
    setNewTour({
      title: tour.title,
      description: tour.description,
      location: tour.location,
      date: tour.date,
      images: tour.images,
      videos: tour.videos || [],
      coverImageIndex: tour.coverImageIndex || 0
    });

    // Load existing images into formImages
    if (tour.images.length > 0) {
      const mainImage = tour.images[tour.coverImageIndex || 0];
      const additionalImages = tour.images.filter((_, index) => index !== (tour.coverImageIndex || 0));

      // Ensure at least 4 slots for additional images
      const additionalSlots = [...additionalImages];
      while (additionalSlots.length < 4) {
        additionalSlots.push(null);
      }

      setFormImages({
        main: mainImage,
        additional: additionalSlots
      });
    } else {
      resetImageForm();
    }

    // Load existing videos
    if (tour.videos && tour.videos.length > 0) {
      setFormVideos(tour.videos);
    } else {
      setFormVideos([]);
    }

    setEditingId(tour.id);
    setShowForm(true);
  };

  const executeDelete = () => {
    const updatedTours = tours.filter(tour => tour.id !== deleteConfirmation.tourId);
    setTours(updatedTours);
    if (editingId === deleteConfirmation.tourId) {
      resetForm();
      setShowForm(false);
    }
    setDeleteConfirmation({ isOpen: false, tourId: null });
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40  px-2 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">College Tour</h1>

          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 bg-blue-400/30 text-blue-950 px-3 py-2 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 hover:shadow-md"
            aria-label="Create new tour"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">New Tour</span>
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
                  College Tour
                </h1>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-blue-400/30 text-blue-950 font-medium rounded-3xl transition-all transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New</span>
              </button>
            </div>
          </header>
        )}

        {/* Year Filter Section */}
        <div className="mb-6">
          <div className="max-w-7xl mx-auto pt-2">
            <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveTab(year)}
                  className={`px-4 sm:px-6 py-2 md:px-6 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === year
                    ? "bg-blue-400/30 text-blue-950 shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {year === "all" ? "All" : year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tours Grid with CollegeTour Card Design */}
        <div className="justify-items-center sm:justify-items-start">
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="w-full h-full cursor-pointer"
                  onClick={() => handleEdit(tour)}
                >
                  <EventCard
                    event={tour}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteConfirmation({ isOpen: true, tourId: id })}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No tours found for {activeTab === "all" ? "any year" : activeTab}
              </h3>
              <p className="text-gray-500">
                {activeTab === "all"
                  ? "Create your first campus tour!"
                  : "Check other years or create a new tour for this year."}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-teal-400 text-white font-medium rounded-3xl hover:from-orange-500 hover:to-teal-500 transition-all transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Tour</span>
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
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${showForm ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${showForm ? 'opacity-50' : 'opacity-0'}`}
            onClick={handleCloseForm}
          />

          {/* Form Panel */}
          <div className={`absolute inset-y-0 right-0 flex w-96 transition-transform duration-300 ease-in-out ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`relative ${isMobile ? 'w-screen' : 'w-screen max-w-lg'}`}>
              <div className="flex flex-col h-full bg-white shadow-xl">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b ">
                  <h2 className="text-lg font-bold text-gray-800">
                    {editingId ? 'Edit' : 'Add New'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1  overflow-y-auto p-4 md:p-6">
                  <form onSubmit={handleSubmit} className="space-y-8 ">
                    {/* Tour Information Form */}
                    <div className="grid grid-cols-1 gap-2  ">
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Tour Title *</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className="w-full p-3 border rounded-xl text-sm"
                          value={newTour.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Main Campus Tour"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Description *</label>
                        <textarea
                          name="description"
                          required
                          className="w-full p-3 border rounded-xl text-sm"
                          rows="3"
                          value={newTour.description}
                          onChange={handleInputChange}
                          placeholder="Tour description..."
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-bold block mb-2 text-gray-700">Location *</label>
                          <input
                            type="text"
                            name="location"
                            required
                            className="w-full p-3 border rounded-xl text-sm"
                            value={newTour.location}
                            onChange={handleInputChange}
                            placeholder="Location"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold block mb-2 text-gray-700">Date *</label>
                          <input
                            type="date"
                            name="date"
                            required
                            className="w-full p-3 border rounded-xl text-sm bg-white"
                            value={newTour.date}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tour Images Section */}
                    <div className="space-y-8">
                      {/* Main Cover Image Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-gray-700">Cover Image *</label>
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <InstructionTooltip />
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            className={`w-full h-64 border-2 ${formImages.main ? 'border-solid' : 'border-dashed'} rounded-2xl relative flex items-center justify-center bg-gray-50 ${formImages.main ? 'border-gray-300' : 'border-gray-200'}`}
                          >
                            {formImages.main ? (
                              <>
                                <img
                                  src={formImages.main}
                                  className="w-full h-full object-cover rounded-2xl"
                                  alt="Main cover"
                                />
                                {/* Remove button on top-right corner */}
                                <button
                                  type="button"
                                  onClick={() => removeImage('main')}
                                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                  aria-label="Remove cover image"
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
                                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Upload Cover Image</span>
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
                          {/* Add Change Image button below the cover image */}
                          {formImages.main && (
                            <button
                              type="button"
                              onClick={() => mainFileInputRef.current.click()}
                              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Change Cover Image
                            </button>
                          )}
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
                          {formImages.additional.filter(img => img !== null).length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages(prev => ({ ...prev, additional: [null, null, null, null] }));
                              }}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear All
                            </button>
                          )}
                        </div>

                        {/* Single Upload Area for Multiple Images */}
                        <div className="relative">
                          <div
                            className={`w-full min-h-[120px] border-2 border-dashed rounded-2xl relative flex flex-col items-center justify-center p-6 ${formImages.additional.filter(img => img !== null).length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                          >
                            {/* Upload Button or Gallery Preview */}
                            {formImages.additional.filter(img => img !== null).length === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const files = Array.from(e.target.files);
                                    const newAdditional = [...formImages.additional];
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
                                          setFormImages(prev => ({ ...prev, additional: paddedAdditional }));
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
                                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium text-gray-700 block mb-1">Click to upload gallery images</span>

                                </div>
                              </button>
                            ) : (
                              <>
                                {/* Gallery Preview */}
                                <div className="w-full">
                                  {/* Image Thumbnails Grid with Add More Button */}
                                  <div className="grid grid-cols-4 gap-3">
                                    {formImages.additional.filter(img => img !== null).map((img, index) => (
                                      <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                          <img
                                            src={img}
                                            className="w-full h-full object-cover"
                                            alt={`Gallery image ${index + 1}`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeImage('additional', formImages.additional.indexOf(img))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10 "
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Standalone Add More Button */}
                                    {formImages.additional.filter(img => img !== null).length > 0 && (
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
                                              const currentImages = [...formImages.additional.filter(img => img !== null)];

                                              files.forEach((file, fileIndex) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  currentImages.push(reader.result);

                                                  if (fileIndex === files.length - 1) {
                                                    const paddedImages = [...currentImages];
                                                    while (paddedImages.length < 4) {
                                                      paddedImages.push(null);
                                                    }
                                                    setFormImages(prev => ({ ...prev, additional: paddedImages }));
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              });
                                            };
                                            input.click();
                                          }}
                                          className="w-14 h-14 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors group"
                                        >
                                          <div className="w-8 h-8 rounded-full  flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-2">
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

                      {/* Video Links Section */}
                      <div className="space-y-4  ">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-gray-700">Video Links</label>
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <div className="absolute left-5 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-gray-800 mb-1">Video Link Tips</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      <li>• Supported platforms: YouTube, Vimeo</li>
                                      <li>• Paste full video URL (e.g., https://youtube.com/watch?v=...)</li>
                                      <li>• YouTube embed URLs work best</li>
                                      <li>• You can add multiple video links</li>
                                      <li>• Links will be embedded in the tour</li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Video Link Input */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="url"
                                value={newVideoLink}
                                onChange={(e) => setNewVideoLink(e.target.value)}
                                placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                                className="w-full p-3 border rounded-xl text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddVideoLink}
                              className="px-4 bg-blue-400/30 text-blue-950 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                              <Link className="w-4 h-4" />
                              Add
                            </button>
                          </div>

                          {/* Video Links List */}
                          {formVideos.length > 0 && (
                            <div className="space-y-3">


                              <div className="space-y-2">
                                {formVideos.map((videoUrl, index) => {
                                  const videoInfo = getVideoInfo(videoUrl);
                                  return (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                          {videoInfo.thumbnail ? (
                                            <img
                                              src={videoInfo.thumbnail}
                                              alt={`${videoInfo.platform} thumbnail`}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="text-gray-400 ">
                                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">

                                          </div>
                                          <p className="text-sm text-gray-700 truncate whitespace-nowrap overflow-hidden text-ellipsis block w-48">
                                            {videoUrl}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeVideo(index)}
                                        className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* No Videos State */}
                          {formVideos.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                              <Link className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 font-medium mb-1">No video links added yet</p>
                              <p className="text-xs text-gray-500">Add YouTube or Vimeo links above</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="grid grid-cols-2 gap-3 ">
                      <button
                        type="button"
                        onClick={handleCloseForm}
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

export default CollegeTourDashboard;  