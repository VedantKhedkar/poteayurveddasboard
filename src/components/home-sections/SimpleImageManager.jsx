import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const SimpleImageManager = ({ onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);

  const BASE_URL = "";


  // Load images from backend on mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/slider");
      const data = await res.json();
      setImages(data.map((img) => ({ id: img.id, url: img.imageUrl })));

      setLoading(false);
    } catch (err) {
      setError("Failed to load images");
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (images.length >= 5) {
      setError("Maximum limit of 5 images reached.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("imageFile", file);

    try {
      const res = await fetch("/api/slider", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchImages(); // Refresh list
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      setError("Server error during upload");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      const res = await fetch(
        `/api/slider/${imageToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setImages(images.filter((img) => img.id !== imageToDelete.id));
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {images.map((image) => (

            <div
              key={image.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              <div className="w-full h-40 bg-gray-100">
                {console.log(image.url)}
                <img
                  src={`${BASE_URL}${image.url}`}
                  alt="slider"
                  className="w-full h-full object-cover"
                />


                <button
                  onClick={() => {
                    setImageToDelete(image);
                    setShowDeleteModal(true);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Placeholder if list is not full */}
          {images.length < 5 && (
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isSaving}
              className="border-2 border-dashed border-gray-200 rounded-lg h-40 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="animate-spin text-blue-500" />
              ) : (
                <Plus className="text-gray-400" />
              )}
              <span className="text-xs text-gray-400 mt-2">
                {isSaving ? "Uploading..." : "Add Image"}
              </span>
            </button>
          )}
        </div>

        <div className="border-t pt-6 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 border rounded-xl">
            Close
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">Delete Image?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg"
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

export default SimpleImageManager;
