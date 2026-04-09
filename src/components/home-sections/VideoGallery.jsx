import React, { useState, useRef, useEffect } from "react";
import {
  Video as VideoIcon,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Star,
  Loader2,
} from "lucide-react";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [editingVideo, setEditingVideo] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoDeleteConfirm, setShowVideoDeleteConfirm] = useState(false);
  const [showImageDeleteConfirm, setShowImageDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  const imageFileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("videos");

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const [vRes, iRes] = await Promise.all([
        fetch("/api/gallery/videos"),
        fetch("/api/gallery/images"),
      ]);

      if (!vRes.ok || !iRes.ok) throw new Error("Failed to fetch gallery data");

      const vData = await vRes.json();
      const iData = await iRes.json();

      setVideos(vData || []);
      setImages(iData || []);
    } catch (e) {
      console.error("Error fetching gallery:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. IMAGE HANDLERS ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("imageFiles", file));

    try {
      const res = await fetch("/api/gallery/images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchGalleryData(); // Sync with database to get Cloudinary URLs
        alert("Images uploaded successfully!");
      } else {
        alert("Server error during upload");
      }
    } catch (e) {
      alert("Network error: Could not reach backend");
    } finally {
      setIsProcessing(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      const res = await fetch(
        `/api/gallery/images/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setShowImageDeleteConfirm(false);
        setImageToDelete(null);
      }
    } catch (e) {
      alert("Delete failed");
    }
  };

  // --- 3. VIDEO HANDLERS ---
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch("/api/gallery/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVideo, featured: false }),
      });
      if (res.ok) {
        await fetchGalleryData();
        setNewVideo({ title: "", url: "", description: "" });
        setShowVideoForm(false);
      }
    } catch (e) {
      alert("Error adding video");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      const res = await fetch(
        `/api/gallery/videos/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setShowVideoDeleteConfirm(false);
        setVideoToDelete(null);
      }
    } catch (e) {
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="w-full">
      {/* Tab and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "videos" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "images" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
          >
            Images
          </button>
        </div>

        <button
          disabled={isProcessing}
          onClick={() =>
            activeTab === "videos"
              ? setShowVideoForm(true)
              : imageFileInputRef.current.click()
          }
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-3xl font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          {activeTab === "videos" ? "Add Video" : "Upload Images"}
        </button>
        <input
          type="file"
          ref={imageFileInputRef}
          multiple
          hidden
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>

      {activeTab === "videos" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden p-4"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-lg mb-3">
                <VideoIcon className="text-gray-400 w-10 h-10" />
              </div>
              <h3 className="font-bold truncate text-gray-800">{v.title}</h3>
              <p className="text-xs text-gray-500 truncate mb-4">{v.url}</p>
              <button
                onClick={() => {
                  setVideoToDelete(v);
                  setShowVideoDeleteConfirm(true);
                }}
                className="p-2 bg-red-50 text-red-600 rounded-lg w-full flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} className="mr-2" /> Delete Video
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl overflow-hidden border group bg-gray-100"
            >
              <img
                src={img.imageUrl ? `${img.imageUrl}` : null}
                className="w-full h-full object-cover"
                alt={img.title || "Gallery"}
              />
              <button
                onClick={() => {
                  setImageToDelete(img);
                  setShowImageDeleteConfirm(true);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Video Sidebar Form */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ${showVideoForm ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">New Video</h2>
            <button
              onClick={() => setShowVideoForm(false)}
              className="hover:bg-gray-100 p-1 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleAddVideo} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
                value={newVideo.title}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste YouTube/Vimeo link"
                value={newVideo.url}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, url: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
                value={newVideo.description}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, description: e.target.value })
                }
                rows="4"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Adding..." : "Save Video"}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modals */}
      {(showVideoDeleteConfirm || showImageDeleteConfirm) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">
              Delete {showVideoDeleteConfirm ? "Video" : "Image"}?
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              This action cannot be undone. The file will be removed from the
              server and database.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowVideoDeleteConfirm(false);
                  setShowImageDeleteConfirm(false);
                }}
                className="flex-1 p-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  showVideoDeleteConfirm
                    ? handleDeleteVideo(videoToDelete.id)
                    : handleDeleteImage(imageToDelete.id)
                }
                className="flex-1 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
