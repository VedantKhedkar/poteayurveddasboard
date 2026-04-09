// components/NewsUpdates.jsx
import React, { useState, useMemo } from 'react';
import { Calendar, ExternalLink, Plus, X, Edit2, Trash2, Upload, AlertTriangle, Info } from 'lucide-react';

const NewsUpdates = () => {
  // State for year tabs - default to "All"
  const [activeYear, setActiveYear] = useState("All");
  
  // State for form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Workshop',
    link: '',
    fullContent: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);

  // Initial data structure for news articles organized by year
  const [newsByYear, setNewsByYear] = useState({
    "2025": [
      {
        id: 1,
        title: "Aerodynamic Seminar",
        description: "Our college is hosting an advanced Aerodynamic Seminar focused on cutting-edge developments, innovative research, and real-world applications in aerodynamic design.",
        imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        date: "2025-03-15",
        category: "Workshop",
        link: "#",
        fullContent: "P. R. Pote Patil College of Architecture successfully organized an Aerodynamic Seminar 2025, highlighting innovative approaches in aerodynamic design and advanced technological applications."
      },
    ],
    "2024": [
      {
        id: 5,
        title: "College Expansion Plan 2024",
        description: "New campus expansion announced with additional facilities and infrastructure.",
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        date: "2024-11-30",
        category: "Infrastructure",
        link: "#",
        fullContent: "Major campus expansion plan announced including new design studios, library wing, and student facilities."
      },
    ],
    "2023": [
      {
        id: 7,
        title: "College Accreditation",
        description: "NAAC accreditation renewed with 'A' grade for the next five years.",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        date: "2023-09-15",
        category: "Accreditations",
        link: "#",
        fullContent: "The college has successfully renewed its NAAC accreditation with 'A' grade, recognizing quality education and infrastructure."
      },
      {
        id: 8,
        title: "College Accreditation",
        description: "NAAC accreditation renewed with 'A' grade for the next five years.",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        date: "2023-09-15",
        category: "Accreditations",
        link: "#",
        fullContent: "The college has successfully renewed its NAAC accreditation with 'A' grade, recognizing quality education and infrastructure."
      },
    ],
  });

  // Calculate total articles count for "All" tab
  const totalArticlesCount = useMemo(() => {
    return Object.values(newsByYear).reduce((total, yearNews) => total + yearNews.length, 0);
  }, [newsByYear]);

  // Get all news articles combined for "All" tab
  const allNews = useMemo(() => {
    return Object.entries(newsByYear)
      .flatMap(([year, articles]) => 
        articles.map(article => ({
          ...article,
          displayYear: year,
          uniqueId: `${year}-${article.id}`
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [newsByYear]);

  // Get news based on active tab
  const currentNews = activeYear === "All" ? allNews : (newsByYear[activeYear] || []);

  // Get available years for filter tabs
  const availableYears = useMemo(() => {
    return Object.keys(newsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  }, [newsByYear]);

  // Define the order of tabs with "All" first
  const tabOrder = ["All", ...availableYears];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size should be less than 5MB');
        return;
      }
      
      // Create local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in required fields');
      return;
    }

    const year = new Date(formData.date).getFullYear().toString();
    const newItem = {
      id: formData.id || Date.now(),
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      date: formData.date,
      category: formData.category,
      link: formData.link,
      fullContent: formData.fullContent || formData.description
    };

    // Update newsByYear state
    setNewsByYear(prev => {
      const updated = { ...prev };
      
      if (isEditing) {
        // Remove from old location
        Object.keys(updated).forEach(yearKey => {
          updated[yearKey] = updated[yearKey].filter(item => item.id !== formData.id);
        });
      }
      
      // Add to new year
      if (!updated[year]) {
        updated[year] = [];
      }
      updated[year] = [newItem, ...updated[year]];
      
      return updated;
    });

    // Reset form
    resetForm();
    setShowForm(false);
  };

  // Edit news item
  const handleEdit = (news) => {
    const year = new Date(news.date).getFullYear().toString();
    setFormData({
      id: news.id,
      title: news.title,
      description: news.description,
      imageUrl: news.imageUrl,
      date: news.date,
      category: news.category,
      link: news.link,
      fullContent: news.fullContent
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (news) => {
    setNewsToDelete(news);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (newsToDelete) {
      setNewsByYear(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(yearKey => {
          updated[yearKey] = updated[yearKey].filter(item => item.id !== newsToDelete.id);
        });
        return updated;
      });
      setShowDeleteModal(false);
      setNewsToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNewsToDelete(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: 0,
      title: '',
      description: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Workshop',
      link: '',
      fullContent: ''
    });
    setIsEditing(false);
  };

  // Remove Image
  const removeImage = () => {
    // Clear the file input
    const fileInput = document.getElementById('image-upload');
    fileInput.value = '';
    
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // News Card Component
  const NewsCard = ({ news }) => {
    return (
      <div className="flex flex-col border w-64 border-gray-200 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl group bg-white">
        {/* Image Area */}
        <div className="relative aspect-video w-full h-48 sm:h-48 md:h-44 overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{formatDate(news.date)}</span>
            </div>
            
            <h3 className="text-sm font-bold text-blue-950 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
              {news.title}
            </h3>
            
            <p className="text-xs  h-12  text-gray-600 line-clamp-3">
              {news.description}
            </p>
          </div>
          
          <div className="">
            <div className="flex justify-end">
             
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(news)}
                  className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(news)}
                  className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add New Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text">
              College News & Updates
            </h1>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-400/30 text-blue-950 font-medium py-2.5 px-6 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {tabOrder.map((tab) => {
              const articleCount = tab === "All" 
                ? totalArticlesCount 
                : (newsByYear[tab]?.length || 0);
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveYear(tab)}
                  className={`px-8 py-2 rounded-3xl transition-all text-sm font-semibold duration-200 font-medium flex items-center gap-2 ${
                    activeYear === tab
                      ? 'bg-blue-400/30 text-blue-950 shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  } ${articleCount === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={articleCount === 0}
                >
                  {tab === "All" ? "All" : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* News Items Grid */}
        {currentNews.length > 0 ? (
          <div className="grid justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentNews.map((news) => (
              <NewsCard 
                key={news.uniqueId || `${activeYear}-${news.id}`} 
                news={news} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm">
            <div className="text-gray-400 mb-4 text-6xl">📰</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeYear === "All" 
                ? "No news articles available" 
                : `No news articles available for ${activeYear}`}
            </h3>
            <p className="text-gray-500 mb-6">
              News articles will be added soon
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {tabOrder.map((tab) => {
                const hasArticles = tab === "All" 
                  ? totalArticlesCount > 0 
                  : (newsByYear[tab]?.length > 0);
                
                return hasArticles ? (
                  <button
                    key={tab}
                    onClick={() => setActiveYear(tab)}
                    className="px-4 py-2 bg-blue-400/30 text-blue-950 rounded-lg text-sm font-medium transition-all duration-300 shadow hover:shadow-md"
                  >
                    {tab === "All" ? "View All News" : `View ${tab} News`}
                  </button>
                ) : null;
              })}
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow hover:shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Item
              </button>
            </div>
          </div>
        )}

        {/* Slide-in Form Overlay */}
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          showForm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showForm ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          
          {/* Slide-in Form */}
          <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            showForm ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                {/* Form Header */}
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {isEditing ? 'Edit News' : 'Add New'}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter news title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter news description"
                      required
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 relative group">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload Image *
                      </label>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        aria-label="Image upload instructions"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      
                      {/* Image Upload Tooltip */}
                      <div className="absolute left-32 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
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
                    </div>
                    
                    {/* Clickable Upload Area */}
                    <div className="mt-1">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      
                      {formData.imageUrl ? (
                        // Preview when image is uploaded - SEPARATE from the label
                        <div className="relative w-64 h-48 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                          <img 
                            src={formData.imageUrl} 
                            alt="Uploaded preview" 
                            className="w-full h-full object-cover"
                          />
                          {/* Remove Image Button - Top Right Corner - NOT inside label */}
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Upload prompt when no image
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer block"
                        >
                          <div className="w-64 h-48 mx-auto p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50">
                            <div className="mb-3 p-3 rounded-full bg-blue-100">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-700 font-medium mb-1">
                              Click to upload image
                            </p>
                            <p className="text-gray-500 text-xs text-center mb-3">
                              Drag & drop or click to browse
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-400/30 text-blue-950 py-3 px-4 rounded-lg transition font-medium shadow-md"
                    >
                      {isEditing ? 'Save Changes' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
              <div className="p-6">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Delete News Item
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">"{newsToDelete?.title}"</span>? 
                    This action cannot be undone.
                  </p>
                </div>
                
                {/* Modal Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
                  >
                    Yes, Delete It
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsUpdates;