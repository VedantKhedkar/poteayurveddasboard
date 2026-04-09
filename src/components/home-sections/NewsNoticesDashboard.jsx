import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";

const NewsNoticesDashboard = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    id: "",
    title: "",
    type: "news",
    fileType: "pdf",
    linkUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/news-notices");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching news/notices:", error);
    }
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem({
      ...item,
      linkUrl: item.fileType === "link" ? item.fileUrl : "",
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  // --- 2. DELETE FROM BACKEND ---
  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await fetch(
          `/api/news-notices/${itemToDelete.id}`,
          {
            method: "DELETE",
          },
        );
        await fetchItems();
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (currentItem.fileType === "pdf" && file.type === "application/pdf") {
        setSelectedFile(file);
        if (!currentItem.title) {
          setCurrentItem((prev) => ({
            ...prev,
            title: file.name.replace(".pdf", "").replace(/_/g, " "),
          }));
        }
      } else if (
        currentItem.fileType === "image" &&
        allowedImageTypes.includes(file.type)
      ) {
        setSelectedFile(file);
        if (!currentItem.title) {
          setCurrentItem((prev) => ({
            ...prev,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          }));
        }
      } else {
        const errorMessage =
          currentItem.fileType === "pdf"
            ? "Please select a PDF file only"
            : "Please select an image file";
        alert(errorMessage);
        e.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (currentItem.id) {
      setCurrentItem((prev) => ({
        ...prev,
        fileUrl: "",
        fileName: "",
        fileSize: "",
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveLink = () => {
    setCurrentItem((prev) => ({ ...prev, linkUrl: "" }));
  };

  const handleFileTypeChange = (type) => {
    const hasContent =
      selectedFile ||
      (currentItem.fileType === "link" && currentItem.linkUrl) ||
      (currentItem.fileType !== "link" && currentItem.fileUrl);
    if (!hasContent || currentItem.fileType === type) {
      setCurrentItem((prev) => ({ ...prev, fileType: type }));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 3. SAVE TO BACKEND ---
  const handleSubmit = async () => {
    if (!currentItem.title.trim()) {
      alert("Please enter a title");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", currentItem.title);
      formData.append("type", currentItem.type);
      formData.append("fileType", currentItem.fileType);

      if (currentItem.id) formData.append("id", currentItem.id);

      if (currentItem.fileType === "link") {
        formData.append("linkUrl", currentItem.linkUrl);
      } else if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("existingFileUrl", currentItem.fileUrl || "");
        formData.append("existingFileName", currentItem.fileName || "");
        formData.append("existingFileSize", currentItem.fileSize || "");
      }

      const res = await fetch("/api/news-notices", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchItems();
        resetForm();
        setShowForm(false);
      } else {
        alert("Failed to save.");
      }
    } catch (error) {
      alert("Operation failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCurrentItem({
      id: "",
      title: "",
      type: "news",
      fileType: "pdf",
      linkUrl: "",
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FaRegFilePdf className="text-orange-400 w-5 h-5" />;
      case "image":
        return <ImageIcon className="text-green-500 w-5 h-5" />;
      case "link":
        return <LinkIcon className="text-blue-500 w-5 h-5" />;
      default:
        return <FaRegFilePdf className="text-orange-400 w-5 h-5" />;
    }
  };

  const getFileTypeBadge = (fileType) => {
    const styles = {
      pdf: "bg-orange-100 text-orange-800",
      image: "bg-green-100 text-green-800",
      link: "bg-blue-100 text-blue-800",
    };
    const labels = { pdf: "PDF", image: "Image", link: "Link" };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[fileType]}`}
      >
        {labels[fileType]}
      </span>
    );
  };

  const isFileTypeDisabled = (type) => {
    const hasContent =
      selectedFile ||
      (currentItem.fileType === "link" && currentItem.linkUrl) ||
      (currentItem.fileType !== "link" && currentItem.fileUrl);
    return hasContent && type !== currentItem.fileType;
  };

  const renderFilePreview = () => {
    if (selectedFile) {
      if (currentItem.fileType === "image") {
        return (
          <div className="mt-3 relative group overflow-hidden">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="w-72 h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-1 right-3 p-2 text-white bg-red-600 rounded-2xl shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
      return (
        <div className="bg-gray-50 p-4 rounded-lg border mt-3 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {getFileTypeIcon(currentItem.fileType)}
            <div className="ml-3 text-left min-w-0">
              <div className="font-medium truncate">{selectedFile.name}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-2 text-white bg-red-600 rounded-2xl"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else if (currentItem.fileUrl && !selectedFile) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border mt-3 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {getFileTypeIcon(currentItem.fileType)}
            <div className="ml-3 text-left min-w-0">
              <div className="font-medium truncate text-gray-400">
                {currentItem.fileName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-2 text-red-600 bg-red-100 rounded-2xl"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-end">
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-6 py-3 bg-blue-400/30 text-blue-950 rounded-3xl transition-colors font-medium shadow-md"
        >
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg truncate flex-1 mr-3">
                {item.title}
              </h3>
              <div className="flex items-center gap-3">
                {getFileTypeBadge(item.fileType)}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 bg-blue-200 rounded-2xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-2 text-red-600 bg-red-200 rounded-2xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar size={16} className="mr-2" />
              <span>Uploaded: {item.uploadDate}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600">No items yet</h3>
        </div>
      )}

      {/* Slide-in Sidebar Form */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-[60] ${showForm ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">
              {currentItem.id ? "Edit Item" : "Add New Notice"}
            </h2>
            <button
              onClick={closeForm}
              disabled={isUploading}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Notice Title *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg outline-none"
                placeholder="Enter title..."
                value={currentItem.title || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, title: e.target.value }))
                }
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Content Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["pdf", "image", "link"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFileTypeChange(type)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${currentItem.fileType === type ? "border-blue-500 bg-blue-50" : isFileTypeDisabled(type) ? "opacity-40 cursor-not-allowed" : "hover:border-gray-300"}`}
                    disabled={isFileTypeDisabled(type) || isUploading}
                  >
                    {getFileTypeIcon(type)}
                    <span className="mt-2 text-sm font-medium capitalize">
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {currentItem.fileType === "link" ? "Link URL *" : "File *"}
              </label>
              {currentItem.fileType === "link" ? (
                <input
                  type="url"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="https://..."
                  value={currentItem.linkUrl || ""}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      linkUrl: e.target.value,
                    }))
                  }
                  disabled={isUploading}
                />
              ) : (
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer"
                  onClick={() =>
                    !selectedFile &&
                    !currentItem.fileUrl &&
                    fileInputRef.current.click()
                  }
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={
                      currentItem.fileType === "pdf"
                        ? ".pdf,application/pdf"
                        : "image/*"
                    }
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  {selectedFile || currentItem.fileUrl ? (
                    renderFilePreview()
                  ) : (
                    <>
                      <ImageIcon className="text-gray-400 w-12 h-12 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Select a{" "}
                        {currentItem.fileType === "pdf" ? "PDF" : "Image"} file
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 flex gap-3 mt-auto">
              <button
                onClick={closeForm}
                disabled={isUploading}
                className="flex-1 px-5 py-3 border rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                {isUploading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={() => !isUploading && closeForm()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-center">
            <Trash2 className="text-red-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-5 py-3 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg"
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

export default NewsNoticesDashboard;
