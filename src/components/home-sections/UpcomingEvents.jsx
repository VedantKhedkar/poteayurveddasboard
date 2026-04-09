import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    coverImage: null,
    coverImagePreview: null,
    additionalImages: [],
    additionalImagesPreviews: [],
    videos: [],
  });

  // --- BACKEND LOGIC ---

  // 1. Fetch Events from DB
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 2. Submit Form (Create or Update)
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

    // Stringify videos array for backend JSON parsing
    data.append("videos", JSON.stringify(formData.videos || []));

    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage); // New file upload
    } else if (isEditing && formData.coverImagePreview) {
      data.append("existingCoverImage", formData.coverImagePreview); // Maintain existing URL
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        await fetchEvents();
        resetForm();
        setShowForm(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Save failed"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Server connection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Confirm Delete
  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `/api/events/${deleteConfirm}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setEvents(events.filter((event) => event.id !== deleteConfirm));
        setDeleteConfirm(null);
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  // --- UI HANDLERS ---

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

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.eventDate
        ? new Date(event.eventDate).toISOString().split("T")[0]
        : "",
      time: event.eventTime
        ? event.eventTime.slice(0, 5)
        : "",
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
      additionalImages: [],
      additionalImagesPreviews: [],
      videos: [],
    });
  };

  const filteredEvents = events.filter((event) => {
    if (yearFilter !== "all") {
      return new Date(event.eventDate).getFullYear().toString() === yearFilter;
    }
    return true;
  });

  const availableYears = Array.from(
    new Set(events.map((e) => new Date(e.eventDate).getFullYear().toString())),
  ).sort((a, b) => b - a);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-60 h-full flex flex-col group border border-gray-200">
      <div className="relative overflow-hidden pt-[60%] w-full">
        <img
          src={
            event.coverImage ? `${event.coverImage}` : null
          }
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xs font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
                className="p-2 bg-blue-200 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors flex items-center justify-center group/edit"
                title="Edit event"
              >
                <Edit2 className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setDeleteConfirm(event.id)}
                className="p-2 bg-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center group/delete"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
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
    <div className="min-h-screen relative overflow-hidden">
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
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
        <div className="mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2 bg-blue-400/30 text-blue-950 font-medium rounded-3xl hover:bg-blue-400/40 transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Add New Event
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
            <button
              onClick={() => setYearFilter("all")}
              className={`px-5 py-2 md:px-8 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${yearFilter === "all" ? "bg-blue-400/30 text-blue-950 shadow-lg" : "bg-gray-100 text-gray-700"}`}
            >
              All
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setYearFilter(year)}
                className={`px-6 py-2 md:px-8 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 ${yearFilter === year ? "bg-blue-400/30 text-blue-950 shadow-lg" : "bg-gray-100 text-gray-700"}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full justify-items-center mx-auto py-4">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="w-full h-full">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Calendar className="w-16 h-16 mx-auto opacity-50 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first academic event using the button above.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-y-0 right-0 w-full lg:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${showForm ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 lg:p-8 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Event" : "Add New Event"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="title"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Event Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="date"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                  required
                />
              </div>
              <div className="w-1/2">
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="time"
                >
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="location"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Event Description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Cover Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                {formData.coverImagePreview ? (
                  <div className="mb-3 relative">
                    <img
                      src={`${formData.coverImagePreview}`}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          coverImagePreview: null,
                          coverImage: null,
                        });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="py-6 cursor-pointer"
                    onClick={() =>
                      document.getElementById("coverImageUpload").click()
                    }
                  >
                    <ImageIcon className="mx-auto w-12 h-12 text-blue-500 mb-2" />
                    <p className="text-gray-600 text-sm">
                      Click to upload cover image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="coverImageUpload"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 bg-gray-100 text-gray-700 h-12 rounded-xl font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-blue-400/30 text-blue-950 h-12 rounded-xl font-medium shadow-md hover:bg-blue-400/50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin mx-auto w-5 h-5" />
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
  );
};

export default UpcomingEvents;
