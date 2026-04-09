import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Info,
  Loader2,
  Link,
} from "lucide-react";

const HighlightedEvents = () => {
  // --- State Management ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newVideoLink, setNewVideoLink] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    coverImage: null,
    coverImagePreview: null,
    videos: [],
  });

  // --- Backend Integration Logic ---

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/highlighted-events");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleAddVideoLink = () => {
    if (!newVideoLink.trim()) return;
    if (!formData.videos.includes(newVideoLink.trim())) {
      setFormData({
        ...formData,
        videos: [...formData.videos, newVideoLink.trim()],
      });
      setNewVideoLink("");
    }
  };

  const removeVideoField = (index) => {
    const newVideos = [...formData.videos];
    newVideos.splice(index, 1);
    setFormData({ ...formData, videos: newVideos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const data = new FormData();
    if (isEditing) data.append("id", editId);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("time", formData.time);
    data.append("location", formData.location);
    data.append("videos", JSON.stringify(formData.videos));
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    } else if (isEditing && formData.coverImagePreview) {
      data.append("existingCoverImage", formData.coverImagePreview);
    }


    try {
      const res = await fetch("/api/highlighted-events", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        await fetchEvents();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      alert("Error saving event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (event) => {
    let formattedDate = "";
    let formattedTime = "";

    // Safe Date Handling
    if (event.eventDate) {
      const d = new Date(event.eventDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split("T")[0];
      }
    }

    // Safe Time Handling
    if (event.eventTime) {
      formattedTime = event.eventTime.slice(0, 5);
    }

    setFormData({
      title: event.title,
      date: formattedDate,
      time: formattedTime,
      location: event.location,
      description: event.description || "",
      coverImage: null,
      coverImagePreview: event.coverImage,
      videos: event.videos || [],
    });

    setIsEditing(true);
    setEditId(event.id);
    setShowForm(true);
  };


  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `/api/highlighted-events/${deleteConfirm}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setEvents(events.filter((event) => event.id !== deleteConfirm));
        setDeleteConfirm(null);
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      coverImage: null,
      coverImagePreview: null,
      videos: [],
    });
    setNewVideoLink("");
  };

  // --- Filtering & Formatting ---
  const getAvailableYears = () => {
    const years = new Set();
    events.forEach((event) => {
      const year = new Date(event.eventDate).getFullYear();
      years.add(year.toString());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const filteredEvents = events
    .filter(
      (e) =>
        yearFilter === "all" ||
        new Date(e.eventDate).getFullYear().toString() === yearFilter,
    )
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- UI Components ---
  const InstructionTooltip = ({ type = "image" }) => (
    <div className="absolute left-5 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-x-1/2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === "image" ? (
            <Info className="w-4 h-4 text-blue-600" />
          ) : (
            <Link className="w-4 h-4 text-purple-600" />
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-800 mb-1">
            {type === "image" ? "Image Tips" : "Video Link Tips"}
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            {type === "image" ? (
              <>
                <li>• Use landscape images (16:9 ratio)</li>
                <li>• Recommended size: 1200x675 pixels</li>
              </>
            ) : (
              <>
                <li>• Supported: YouTube, Vimeo</li>
                <li>• Paste full URL</li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 -translate-x-1/2"></div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full flex flex-col group border border-gray-200">
      <div className="relative overflow-hidden pt-[60%] w-full">
        <img
          src={event.coverImage ? `${event.coverImage}` : null}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium">
              {formatDate(event.eventDate)}
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock className="w-4 h-4 mr-3 text-teal-500 flex-shrink-0" />
            <span className="text-xs font-medium">{event.eventTime}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-gray-700 flex-1 min-w-0">
              <MapPin className="w-4 h-4 mr-3 text-red-500 flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <button
                onClick={() => handleEdit(event)}
                className="p-2 bg-blue-200 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(event.id)}
                className="p-2 bg-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowForm(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end py-4">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-2 bg-blue-400/30 text-blue-950 font-medium rounded-3xl hover:bg-blue-400/40 flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Event
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setYearFilter("all")}
            className={`px-8 py-2 rounded-full text-sm font-semibold ${yearFilter === "all" ? "bg-blue-400/30 text-blue-950 shadow-lg" : "bg-gray-100 text-gray-700"}`}
          >
            All
          </button>
          {getAvailableYears().map((year) => (
            <button
              key={year}
              onClick={() => setYearFilter(year)}
              className={`px-8 py-2 rounded-full text-sm font-semibold ${yearFilter === year ? "bg-blue-400/30 text-blue-950 shadow-lg" : "bg-gray-100 text-gray-700"}`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 justify-items-center">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Slide-in Form Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${showForm ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold">
              {isEditing ? "Edit Event" : "Add New Event"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="title"
                required
                className="w-full p-3 border rounded-xl"
                placeholder="Event Title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <textarea
                name="description"
                required
                className="w-full p-3 border rounded-xl"
                rows="3"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  required
                  className="p-3 border rounded-xl"
                  value={formData.date}
                  onChange={handleInputChange}
                />
                <input
                  type="time"
                  name="time"
                  required
                  className="p-3 border rounded-xl"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
              <input
                name="location"
                required
                className="w-full p-3 border rounded-xl"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
              />

              <div className="space-y-2">
                <div className="flex items-center gap-2 group relative">
                  <label className="text-sm font-bold">Cover Image *</label>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <InstructionTooltip type="image" />
                </div>
                <div className="w-full h-40 border-2 border-dashed rounded-2xl flex items-center justify-center bg-gray-50 relative overflow-hidden">
                  {formData.coverImagePreview ? (
                    <img
                      src={
                        formData.coverImagePreview?.startsWith("blob:")
                          ? formData.coverImagePreview
                          : `${formData.coverImagePreview}`
                      }
                      className="w-full h-full object-cover"
                    />

                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("coverImageUpload").click()
                      }
                      className="text-blue-500 text-sm"
                    >
                      Upload Cover Image
                    </button>
                  )}
                  <input
                    type="file"
                    id="coverImageUpload"
                    hidden
                    onChange={handleCoverImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 group relative">
                  <label className="text-sm font-bold">Video Links</label>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <InstructionTooltip type="video" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 p-3 border rounded-xl"
                    value={newVideoLink}
                    onChange={(e) => setNewVideoLink(e.target.value)}
                    placeholder="Paste URL"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoLink}
                    className="px-4 bg-blue-100 text-blue-950 rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.videos.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
                    >
                      <span className="text-xs truncate max-w-[200px]">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVideoField(i)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-blue-400/30 text-blue-950 rounded-xl font-bold"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedEvents;
