"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

import ActionButtons from "./uic/ActionButtons";
import DeleteModal from "./uic/deletemodal";

const MEDIA_Download =
  "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";
const MEDIA_Upload =
  "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";

const Dashboard = () => {
  const [review, setreview] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "", // store only filename
    imageFile: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchreview();
  }, []);

  const fetchreview = async () => {
    try {
      const res = await fetch("https://api.jarayuayurved.com/api/review");
      const json = await res.json();

      // Sort by ID (oldest first)
      const sorted = json.sort((a, b) => a.id - b.id);

      // attach imageUrl from filename
      const updated = sorted.map((d) => ({
        ...d,
        imageUrl: d.image ? `${MEDIA_Download}/${d.image}` : "",
      }));

      setreview(updated);
    } catch (err) {
      console.error("Failed to fetch review:", err);
    }
  };

  const startAdding = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", image: "", imageFile: null });
    setIsAdding(true);
    setIsEditing(true);
  };

  const startEditing = (disease) => {
    setEditingId(disease.id);
    setFormData({
      name: disease.name,
      description: disease.description,
      image: disease.image || "", // keep only filename
      imageFile: null,
    });
    setIsAdding(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", image: "", imageFile: null });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
    }
  };

  const uploadImage = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(MEDIA_Upload, { method: "POST", body: fd });
      const data = await res.json();
      if (data.uploadedImages && data.uploadedImages.length > 0) {
        return {
          filename: data.uploadedImages[0].filename, // ONLY filename
        };
      }
      return { filename: "" };
    } catch (err) {
      console.error("Image upload failed:", err);
      return { filename: "" };
    }
  };

  const saveChanges = async () => {
    try {
      let uploadedFilename = formData.image;

      // if new file uploaded → get filename
      if (formData.imageFile) {
        const uploaded = await uploadImage(formData.imageFile);
        uploadedFilename = uploaded.filename;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        image: uploadedFilename, // only filename saved to DB
      };

      const url = editingId
        ? `https://api.jarayuayurved.com/api/review/${editingId}`
        : "https://api.jarayuayurved.com/api/review";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (editingId) {
        setreview((prev) =>
          prev.map((d) =>
            d.id === editingId
              ? {
                  ...result,
                  imageUrl: result.image
                    ? `${MEDIA_Download}/${result.image}`
                    : "",
                }
              : d
          )
        );
      } else {
        setreview((prev) => [
          ...prev,
          {
            ...result,
            imageUrl: result.image ? `${MEDIA_Download}/${result.image}` : "",
          },
        ]);
      }

      cancelEditing();
    } catch (err) {
      console.error("Failed to save disease:", err);
    }
  };

  const deleteDisease = async (id) => {
    try {
      await fetch(`https://api.jarayuayurved.com/api/review/${id}`, {
        method: "DELETE",
      });
      setreview((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete disease:", err);
    }
  };

  return (
    <div className="h-screen mb-10 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Review Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Manage review with name, description & image
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAdding}
            className="bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 font-medium py-2 px-14 rounded-lg"
          >
            Add 
          </motion.button>
        </div>

        {/* Review List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {review.map((disease) => (
            <motion.div
              key={disease.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 flex overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              {disease.imageUrl && (
                <img
                  src={disease.imageUrl}
                  alt={disease.name}
                  className="w-28 h-28 object-cover flex-shrink-0"
                />
              )}

              {/* Content */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {disease.name}
                  </h2>
                  {/* <p className="text-gray-600 text-sm">{disease.description}</p> */}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex justify-end space-x-3">
                  <button
                    onClick={() => startEditing(disease)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                    aria-label={`Edit ${disease.name}`}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete(disease.id);
                      setShowConfirm(true);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                    aria-label={`Delete ${disease.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Drawer Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-full sm:max-w-3xl h-full bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">
                    {isAdding ? "Add Review" : "Edit Review"}
                  </h2>
                  <button onClick={cancelEditing}>✕</button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <textarea
                    name="description"
                    placeholder="Review"
                    value={formData.description}
                    rows={10}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />

                  {/* Image Upload */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed flex justify-center items-center overflow-hidden bg-gray-100">
                      {formData.imageFile ? (
                        <img
                          src={URL.createObjectURL(formData.imageFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : formData.image ? (
                        <img
                          src={`${MEDIA_Download}/${formData.image}`}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="file-input"
                        onChange={handleFileChange}
                      />
                      <motion.label
                        htmlFor="file-input"
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 px-4 py-2 rounded cursor-pointer"
                      >
                        {formData.image || formData.imageFile
                          ? "Change Image"
                          : "Upload Image"}
                      </motion.label>
                    </div>
                  </div>
                </div>

                <ActionButtons
                  isAdding={isAdding}
                  onSave={saveChanges}
                  onCancel={cancelEditing}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showConfirm}
          message="Are you sure you want to delete this review?"
          onConfirm={() => {
            deleteDisease(itemToDelete);
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
