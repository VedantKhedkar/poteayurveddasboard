import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Edit2, Trash2, Star, Image as ImageIcon, Video, X, Plus, FileText, Info, Link, AlertTriangle } from "lucide-react";

const AcademicEventsDashboard = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Annual Science Symposium",
      date: "2024-03-15",
      time: "10:00",
      location: "Main Auditorium",
      description: "Join us for the Annual Science Symposium featuring cutting-edge research presentations from top scientists and researchers. This event includes keynote speeches, panel discussions, and networking opportunities.",
      coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ],
      videos: [
        "https://www.youtube.com/watch?v=example1",
        "https://vimeo.com/example2"
      ],
      isHighlighted: true,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z"
    },
    {
      id: 2,
      title: "International Research Conference",
      date: "2024-04-22",
      time: "09:30",
      location: "Conference Hall",
      description: "An international gathering of researchers presenting their latest findings across various disciplines. The conference will feature workshops, paper presentations, and poster sessions.",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      additionalImages: [],
      videos: ["https://www.youtube.com/watch?v=conference2024"],
      isHighlighted: false,
      createdAt: "2024-01-12T14:30:00Z",
      updatedAt: "2024-01-12T14:30:00Z"
    }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    coverImage: null,
    coverImagePreview: null,
    additionalImages: [],
    additionalImagesPreviews: [],
    videos: [''],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newVideoLink, setNewVideoLink] = useState('');

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('academicEvents');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        if (parsedEvents.length > 0) {
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('academicEvents', JSON.stringify(events));
  }, [events]);

  // Get available years for filtering
  const getAvailableYears = () => {
    const years = new Set();
    events.forEach(event => {
      const year = new Date(event.date).getFullYear();
      years.add(year.toString());
    });
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear().toString();
    const nextYear = (new Date().getFullYear() + 1).toString();
    const lastYear = (new Date().getFullYear() - 1).toString();
    
    if (!sortedYears.includes(currentYear)) sortedYears.unshift(currentYear);
    if (!sortedYears.includes(nextYear)) sortedYears.unshift(nextYear);
    if (!sortedYears.includes(lastYear)) sortedYears.push(lastYear);
    
    return sortedYears.slice(0, 5);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          coverImage: file,
          coverImagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = [];
      const loadImage = (file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews[index] = { file, preview: reader.result };
          if (newPreviews.length === files.length && newPreviews.every(p => p !== undefined)) {
            setFormData({
              ...formData,
              additionalImages: [...formData.additionalImages, ...files],
              additionalImagesPreviews: [...formData.additionalImagesPreviews, ...newPreviews.map(p => p.preview)]
            });
          }
        };
        reader.readAsDataURL(file);
      };
      
      files.forEach((file, index) => {
        loadImage(file, index);
      });
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...formData.additionalImages];
    const newPreviews = [...formData.additionalImagesPreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      additionalImages: newImages,
      additionalImagesPreviews: newPreviews
    });
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...formData.videos];
    newVideos[index] = value;
    setFormData({
      ...formData,
      videos: newVideos
    });
  };

  const addVideoField = () => {
    setFormData({
      ...formData,
      videos: [...formData.videos, '']
    });
  };

  const removeVideoField = (index) => {
    if (formData.videos.length > 1) {
      const newVideos = [...formData.videos];
      newVideos.splice(index, 1);
      setFormData({
        ...formData,
        videos: newVideos
      });
    }
  };

  const handleAddVideoLink = () => {
    if (!newVideoLink.trim()) {
      alert("Please enter a video link");
      return;
    }

    try {
      new URL(newVideoLink);
      
      if (!formData.videos.includes(newVideoLink.trim())) {
        setFormData({
          ...formData,
          videos: [...formData.videos.filter(v => v.trim()), newVideoLink.trim()]
        });
        setNewVideoLink("");
      } else {
        alert("This video link is already added");
      }
    } catch (error) {
      alert("Please enter a valid URL");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    if (!formData.coverImagePreview) {
      alert('Cover image is required');
      return;
    }

    // Filter out empty video URLs
    const validVideos = formData.videos.filter(video => video.trim() !== '');

    const newEvent = {
      id: isEditing ? editId : Date.now(),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      description: formData.description,
      coverImage: formData.coverImagePreview || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      additionalImages: formData.additionalImagesPreviews,
      videos: validVideos,
      isHighlighted: isEditing ? events.find(e => e.id === editId)?.isHighlighted || false : false,
      createdAt: isEditing ? events.find(e => e.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      setEvents(events.map(event => 
        event.id === editId ? { ...event, ...newEvent } : event
      ));
      setIsEditing(false);
      setEditId(null);
    } else {
      setEvents([newEvent, ...events]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description || '',
      coverImage: null,
      coverImagePreview: event.coverImage,
      additionalImages: [],
      additionalImagesPreviews: event.additionalImages || [],
      videos: event.videos && event.videos.length > 0 ? event.videos : [''],
    });
    setIsEditing(true);
    setEditId(event.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setEvents(events.filter(event => event.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleEventHighlight = (id) => {
    setEvents(events.map(event => {
      if (event.id === id) {
        return {
          ...event,
          isHighlighted: !event.isHighlighted,
          updatedAt: new Date().toISOString()
        };
      }
      return event;
    }));
  };

  // Filter events based on selected year filter
  const filteredEvents = events.filter(event => {
    if (yearFilter !== 'all') {
      const eventYear = new Date(event.date).getFullYear().toString();
      return eventYear === yearFilter;
    }
    return true;
  });

  // Sort events: highlighted first, then by date (soonest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.isHighlighted && !b.isHighlighted) return -1;
    if (!a.isHighlighted && b.isHighlighted) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      coverImage: null,
      coverImagePreview: null,
      additionalImages: [],
      additionalImagesPreviews: [],
      videos: [''],
    });
    setNewVideoLink('');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const availableYears = getAvailableYears();

  // Instruction Tooltip Component
  const InstructionTooltip = ({ type = "image" }) => (
    <div className="absolute left-5 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === "image" ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-800 mb-1">
            {type === "image" ? "Image Tips" : "Video Link Tips"}
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            {type === "image" ? (
              <>
                <li>• Use landscape images (16:9 aspect ratio)</li>
                <li>• Recommended size: 1200x675 pixels</li>
                <li>• Supported formats: JPG, JPEG, PNG</li>
                <li>• Max file size: 5MB</li>
                <li>• For best quality, use high-resolution images</li>
              </>
            ) : (
              <>
                <li>• Supported platforms: YouTube, Vimeo</li>
                <li>• Paste full video URL (e.g., https://youtube.com/watch?v=...)</li>
                <li>• YouTube embed URLs work best</li>
                <li>• You can add multiple video links</li>
                <li>• Links will be embedded in the event</li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
    </div>
  );

  // Event Card Component
 const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-64 h-full flex flex-col group border border-gray-200 relative">
      {/* Highlight Star Button - Top Right Corner */}
      <button
        onClick={() => toggleEventHighlight(event.id)}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
        title={event.isHighlighted ? "Remove highlight" : "Highlight event"}
      >
        <Star 
          className={`w-5 h-5 ${event.isHighlighted ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
        />
      </button>

      {/* Event Cover Image */}
      <div className="relative overflow-hidden pt-[60%] w-full">
        <img 
          src={event.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} 
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Event Details */}
      <div className="pt-6 pl-6 pr-6 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-xs mb-4 line-clamp-2 flex-1">
          {event.description}
        </p>
        
        {/* Event Info Icons */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="w-4 h-4 mr-3 text-teal-500 flex-shrink-0" />
            <span className="text-xs font-medium">{event.time}</span>
          </div>
          
          {/* Location row */}
          <div className="flex items-center text-gray-700 pt-2">
            <MapPin className="w-4 h-4 mr-3 text-red-500 flex-shrink-0" />
            <span className="text-xs font-medium truncate">{event.location}</span>
          </div>
          
         
        </div>
         
      </div>
      {/* Edit and Delete buttons - Now in bottom-right corner */}
          <div className="flex justify-end pb-2 pr-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(event)}
                className="p-2 bg-blue-200 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors flex items-center justify-center group/edit"
                title="Edit event"
              >
                <Edit2 className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-2 bg-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center group/delete"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
              </button>
            </div>
          </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600 mt-2">This event will be permanently deleted.</p>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={cancelDelete}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header with border-left design */}
        <div className="md:pt-1 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between  items-center">
              <h1 className="text-xl md:text-3xl font-bold">
                Academic Events
              </h1>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="px-6 py-2 bg-blue-400/30 text-blue-950 font-medium rounded-3xl hover:bg-blue-400/40 transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New 
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Year Tabs Filter */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
            <button
              onClick={() => setYearFilter('all')}
              className={`px-5 py-2 md:px-8 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                yearFilter === 'all'
                  ? "bg-blue-400/30 text-blue-950 shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All 
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setYearFilter(year)}
                className={`px-6 py-2 md:px-8 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  yearFilter === year
                    ? "bg-blue-400/30 text-blue-950 shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {year} 
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl justify-items-center mx-auto px-4 md:px-8 py-4">
          {sortedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedEvents.map((event) => (
                <div key={event.id} className="w-full h-full">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 mb-6">
                {yearFilter !== 'all' 
                  ? `No events found for ${yearFilter}. Try changing the year filter.`
                  : "Add your first academic event using the 'Add New Event' button."}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-2 bg-blue-400/30 text-blue-950 font-medium rounded-3xl hover:bg-blue-400/40 transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-in Form Panel */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${showForm ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${showForm ? 'opacity-50' : 'opacity-0'}`}
          onClick={() => setShowForm(false)}
        />

        {/* Form Panel */}
        <div className={`absolute inset-y-0 right-0 flex w-96 transition-transform duration-300 ease-in-out ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="relative w-screen max-w-lg">
            <div className="flex flex-col h-full bg-white shadow-xl">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h2 className="text-lg font-bold text-gray-800">
                  {isEditing ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Event Information Form */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-sm font-bold block mb-2 text-gray-700">Event Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="w-full p-3 border rounded-xl text-sm"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Annual Science Symposium"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold block mb-2 text-gray-700">Description *</label>
                      <textarea
                        name="description"
                        required
                        className="w-full p-3 border rounded-xl text-sm"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Event description..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Date *</label>
                        <input
                          type="date"
                          name="date"
                          required
                          className="w-full p-3 border rounded-xl text-sm bg-white"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold block mb-2 text-gray-700">Time *</label>
                        <input
                          type="time"
                          name="time"
                          required
                          className="w-full p-3 border rounded-xl text-sm"
                          value={formData.time}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold block mb-2 text-gray-700">Location *</label>
                      <input
                        type="text"
                        name="location"
                        required
                        className="w-full p-3 border rounded-xl text-sm"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Auditorium"
                      />
                    </div>
                  </div>

                  {/* Cover Image Section */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-gray-700">Cover Image *</label>
                          <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <InstructionTooltip type="image" />
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div
                          className={`w-full h-64 border-2 ${formData.coverImagePreview ? 'border-solid' : 'border-dashed'} rounded-2xl relative flex items-center justify-center bg-gray-50 ${formData.coverImagePreview ? 'border-gray-300' : 'border-gray-200'}`}
                        >
                          {formData.coverImagePreview ? (
                            <>
                              <img
                                src={formData.coverImagePreview}
                                className="w-full h-full object-cover rounded-2xl"
                                alt="Cover preview"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, coverImagePreview: null, coverImage: null});
                                  const fileInput = document.getElementById('coverImageUpload');
                                  if (fileInput) fileInput.value = '';
                                }}
                                className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => document.getElementById('coverImageUpload').click()}
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
                            id="coverImageUpload"
                            hidden
                            onChange={handleCoverImageChange}
                            accept="image/*"
                            required={!formData.coverImagePreview}
                          />
                        </div>
                        {formData.coverImagePreview && (
                          <button
                            type="button"
                            onClick={() => document.getElementById('coverImageUpload').click()}
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
                            <div className="absolute left-5 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-gray-800 mb-1">Gallery Image Tips</p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Multiple images can be uploaded at once</li>
                                    <li>• Recommended size: 800x600 pixels</li>
                                    <li>• Supported formats: JPG, JPEG, PNG</li>
                                    <li>• Max file size: 5MB each</li>
                                    <li>• For best quality, use high-resolution images</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
                            </div>
                          </div>
                        </div>
                        {formData.additionalImagesPreviews.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, additionalImages: [], additionalImagesPreviews: []});
                            }}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <div
                          className={`w-full min-h-[120px] border-2 border-dashed rounded-2xl relative flex flex-col items-center justify-center p-6 ${formData.additionalImagesPreviews.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          {formData.additionalImagesPreviews.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = 'image/*';
                                input.onchange = (e) => handleAdditionalImagesChange(e);
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
                                <span className="text-xs text-gray-500">Multiple images can be selected</span>
                              </div>
                            </button>
                          ) : (
                            <>
                              <div className="w-full">
                                <div className="grid grid-cols-4 gap-3">
                                  {formData.additionalImagesPreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                          src={preview}
                                          className="w-full h-full object-cover"
                                          alt={`Gallery image ${index + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeAdditionalImage(index)}
                                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.accept = 'image/*';
                                        input.onchange = (e) => handleAdditionalImagesChange(e);
                                        input.click();
                                      }}
                                      className="w-14 h-14 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors group"
                                    >
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-2">
                                        <Plus className="w-5 h-5 text-blue-500" />
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video Links Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-gray-700">Video Links</label>
                          <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <InstructionTooltip type="video" />
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
                        {formData.videos.filter(v => v.trim()).length > 0 && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              {formData.videos.filter(v => v.trim()).map((videoUrl, index) => {
                                const getVideoInfo = (url) => {
                                  try {
                                    const urlObj = new URL(url);
                                    const hostname = urlObj.hostname;
                                    let videoId = '';
                                    
                                    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                                      if (url.includes('youtube.com/watch?v=')) {
                                        videoId = url.split('v=')[1]?.split('&')[0];
                                      } else if (url.includes('youtu.be/')) {
                                        videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                      }
                                      return {
                                        platform: 'YouTube',
                                        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
                                      };
                                    }
                                    
                                    if (hostname.includes('vimeo.com')) {
                                      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
                                      return {
                                        platform: 'Vimeo',
                                        thumbnail: null,
                                      };
                                    }
                                    
                                    return {
                                      platform: 'Video',
                                      thumbnail: null,
                                    };
                                  } catch (error) {
                                    return {
                                      platform: 'Unknown',
                                      thumbnail: null,
                                    };
                                  }
                                };
                                
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
                                          <div className="text-gray-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
                                            {videoInfo.platform}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 truncate whitespace-nowrap overflow-hidden text-ellipsis block w-48">
                                          {videoUrl}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeVideoField(index)}
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
                        {formData.videos.filter(v => v.trim()).length === 0 && (
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
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                      className="px-6 bg-gray-100 text-gray-700 h-12 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-400/30 text-blue-950 h-12 rounded-xl font-medium shadow-md hover:bg-blue-400/50 transition-colors"
                    >
                      {isEditing ? 'Save Changes' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicEventsDashboard;