// VideoGallery.jsx
import React, { useState } from 'react';

const VideoGallery = () => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Getting Started React',
      url: 'https://example.com/video1.mp4',
      featured: true,
    },
    {
      id: 2,
      title: 'Mastering Tailwind CSS',
      url: 'https://example.com/video2.mp4',
      featured: false,
    },
    {
      id: 3,
      title: 'Vite Setup Tutorial',
      url: 'https://example.com/video3.mp4',
      featured: true,
    },
    {
      id: 4,
      title: 'Responsive Design ',
      url: 'https://example.com/video4.mp4',
      featured: false,
    },
  ]);

  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
  });

  const [editingVideo, setEditingVideo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;

    const videoToAdd = {
      id: videos.length + 1,
      ...newVideo,
      featured: false,
    };

    setVideos([...videos, videoToAdd]);
    setNewVideo({ title: '', url: '' });
    setShowAddForm(false);
  };

  const handleEditVideo = (e) => {
    e.preventDefault();
    if (!editingVideo.title.trim() || !editingVideo.url.trim()) return;

    setVideos(
      videos.map((video) =>
        video.id === editingVideo.id ? editingVideo : video
      )
    );
    
    setEditingVideo(null);
    setShowEditForm(false);
  };

  const handleStartEdit = (video) => {
    setEditingVideo({ ...video });
    setShowEditForm(true);
  };

  const handleFeaturedToggle = (id) => {
    setVideos(
      videos.map((video) =>
        video.id === id ? { ...video, featured: !video.featured } : video
      )
    );
  };

  const handleDeleteVideo = (id) => {
    setVideos(videos.filter((video) => video.id !== id));
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
  };

  const handleCancelForm = () => {
    setNewVideo({ title: '', url: '' });
    setShowAddForm(false);
  };

  const handleCancelEditForm = () => {
    setEditingVideo(null);
    setShowEditForm(false);
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Video Gallery</h1>
            <p className="text-gray-600 mt-2">Manage your video collection</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-400/30 text-blue-950 font-medium rounded-3xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
          >
            + Add New
          </button>
        </div>

        {/* All Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Videos</h2>
          {videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500 text-lg">No videos added yet. Click "Add New" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onFeaturedToggle={handleFeaturedToggle}
                  onDelete={() => handleDeleteClick(video)}
                  onEdit={handleStartEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Video Form Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelForm}
            />
            
            {/* Slide-in form */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              {/* Form Panel */}
              <div className="relative w-screen max-w-md">
                <div className="h-full bg-white shadow-xl overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {/* Form Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                          Add New Video
                        </h2>
                        <button
                          onClick={handleCancelForm}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-6">
                      <form onSubmit={handleAddVideo} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Title
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={newVideo.title}
                            onChange={(e) =>
                              setNewVideo({ ...newVideo, title: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter video title"
                            required
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="url"
                            value={newVideo.url}
                            onChange={(e) =>
                              setNewVideo({ ...newVideo, url: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/video.mp4"
                            required
                          />
                        </div>

                        {/* Form Actions */}
                        <div>
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={handleCancelForm}
                              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-blue-400/30 text-blue-950 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Add Video
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Video Form Overlay */}
        {showEditForm && editingVideo && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelEditForm}
            />
            
            {/* Slide-in form */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              {/* Form Panel */}
              <div className="relative w-screen max-w-md">
                <div className="h-full bg-white shadow-xl overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {/* Form Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                          Edit Video
                        </h2>
                        <button
                          onClick={handleCancelEditForm}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-6">
                      <form onSubmit={handleEditVideo} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Title
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingVideo.title}
                            onChange={(e) =>
                              setEditingVideo({ ...editingVideo, title: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter video title"
                            required
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="url"
                            value={editingVideo.url}
                            onChange={(e) =>
                              setEditingVideo({ ...editingVideo, url: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/video.mp4"
                            required
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="edit-featured"
                            checked={editingVideo.featured}
                            onChange={(e) =>
                              setEditingVideo({ ...editingVideo, featured: e.target.checked })
                            }
                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor="edit-featured"
                            className="ml-3 text-sm text-gray-700 font-medium"
                          >
                            Mark as Featured
                          </label>
                        </div>

                        {/* Form Actions */}
                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={handleCancelEditForm}
                              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-blue-400/30 text-blue-950 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && videoToDelete && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelDelete}
            />
            
            {/* Confirmation Dialog */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
                {/* Dialog Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Delete Video
                  </h2>
                </div>

                {/* Dialog Content */}
                <div className="p-6">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete this video?
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        "{videoToDelete.title}" will be permanently removed from your video gallery. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {/* Dialog Actions */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(videoToDelete.id)}
                      className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Video Card Component with Edit button
const VideoCard = ({ video, onFeaturedToggle, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      {/* Video Thumbnail/Preview */}
      <div className="aspect-video bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        
        {/* Single star button in top-right corner - toggles featured status */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => onFeaturedToggle(video.id)}
            className={`rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-110 ${
              video.featured 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-white/80 hover:bg-white group-hover:bg-white'
            } ${!video.featured && 'opacity-70 group-hover:opacity-100'}`}
            aria-label={video.featured ? "Remove from featured" : "Mark as featured"}
          >
            <svg
              className={`w-5 h-5 ${video.featured ? 'text-white fill-white' : 'text-gray-600'}`}
              fill={video.featured ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={video.featured ? 0 : 1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1 mr-2">
            {video.title}
          </h3>
        </div>
       

        {/* Actions */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              video.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {video.featured ? 'Highlighted' : 'Not Highlighted'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Edit Button */}
            <button
              onClick={() => onEdit(video)}
              className="text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl p-2 transition-colors duration-200"
              aria-label="Edit video"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(video)}
              className="text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl p-2 transition-colors duration-200"
              aria-label="Delete video"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;