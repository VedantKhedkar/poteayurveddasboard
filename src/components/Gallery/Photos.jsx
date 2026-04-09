"use client";
import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import ActionButtons from "../uic/ActionButtons";
import Alert from "../uic/Alert";

const MEDIA_Download =
  "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";
const MEDIA_Upload =
  "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jarayuayurved";

const Photos = () => {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [gallery, setGallery] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({
    gallery: { uploads: [], deletions: [] },
  });
  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch("https://api.jarayuayurved.com/api/gallery");
      if (!res.ok) return;
      const data = await res.json();
      setGallery(
        data.map((img) => ({
          ...img,
          preview: img.url ? `${MEDIA_Download}/${img.url}` : "",
        }))
      );
    } catch (err) {
      console.error("Error fetching gallery:", err);
    }
  };

  const triggerGalleryUpload = () => galleryFileInputRef.current.click();

  const addGalleryImage = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newUploads = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    setPendingChanges((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        uploads: [...prev.gallery.uploads, ...newUploads],
      },
    }));

    setGallery((prev) => [...prev, ...newUploads]);
  };

  const deleteGalleryImage = (id) => {
    const isTemp = id.startsWith("temp-");

    setPendingChanges((prev) => ({
      ...prev,
      gallery: {
        uploads: isTemp
          ? prev.gallery.uploads.filter((u) => u.id !== id)
          : prev.gallery.uploads,
        deletions: isTemp
          ? prev.gallery.deletions
          : [...prev.gallery.deletions, id],
      },
    }));

    setGallery((prev) => prev.filter((img) => img.id !== id));
  };

  const uploadFileToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(MEDIA_Upload, { method: "POST", body: formData });
      const data = await res.json();
      if (data.uploadedImages && data.uploadedImages.length > 0) {
        return data.uploadedImages[0].filename;
      }
      return null;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  const saveGallery = async () => {
    try {
      // Delete images
      for (const id of pendingChanges.gallery.deletions) {
        await fetch(`https://api.jarayuayurved.com/api/gallery/${id}`, {
          method: "DELETE",
        });
      }

      // Upload new images
      for (const item of pendingChanges.gallery.uploads) {
        const filename = await uploadFileToServer(item.file);
        if (filename) {
          await fetch("https://api.jarayuayurved.com/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: filename }),
          });
        }
      }

      setPendingChanges({ gallery: { uploads: [], deletions: [] } });
      fetchGallery();

      // ✅ Show success alert properly
      setAlert({
        show: true,
        message: "Gallery changes saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      // ✅ Show error alert properly
      setAlert({
        show: true,
        message: "Failed to save gallery changes",
        type: "error",
      });
    }
  };

  const cancelGalleryChanges = () => {
    fetchGallery();
    setPendingChanges({ gallery: { uploads: [], deletions: [] } });
    setAlert({
      show: true,
      message: "Gallery changes canceled",
      type: "info",
    });
  };

  const hasGalleryChanges =
    pendingChanges.gallery.uploads.length > 0 ||
    pendingChanges.gallery.deletions.length > 0;

  return (
    <div className="space-y-6 mb-20">
      <div className="mb-6">
        {gallery.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <ImageIcon className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-500 mb-4">No slider images added yet</p>
            <button
              onClick={triggerGalleryUpload}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
            >
              <Upload className="mr-2" /> Select Images
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden group relative"
              >
                <div className="flex h-[140px] items-center justify-center bg-gray-100">
                  <img
                    src={item.preview}
                    alt="gallery preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteGalleryImage(item.id)}
                    className="bg-red-600 text-white p-1 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {pendingChanges.gallery.uploads.some(
                  (u) => u.id === item.id
                ) && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    New
                  </div>
                )}

                {pendingChanges.gallery.deletions.includes(item.id) && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    To be deleted
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center border-gray-200">
        <input
          type="file"
          ref={galleryFileInputRef}
          onChange={addGalleryImage}
          className="hidden"
          accept="image/*"
          multiple
        />

        <button
          onClick={triggerGalleryUpload}
          className="text-sm bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 w-full px-4 py-2 rounded justify-center flex items-center"
        >
          Add More Images
        </button>
      </div>

      <ActionButtons
        onSave={saveGallery}
        onCancel={cancelGalleryChanges}
        disabled={!hasGalleryChanges}
      />

      <Alert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </div>
  );
};

export default Photos;
