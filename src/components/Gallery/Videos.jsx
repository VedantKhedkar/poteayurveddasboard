"use client";
import React, { useState, useEffect, useRef } from "react";
import { Trash2, Youtube } from "lucide-react";
import ActionButtons from "../uic/ActionButtons";
import Alert from "../uic/Alert";

const API_BASE = "https://api.jarayuayurved.com";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [videoURL, setVideoURL] = useState("");
  const [pendingChanges, setPendingChanges] = useState({
    videos: { uploads: [], deletions: [] },
  });

  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const videoInputRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/youtube`);
      if (!res.ok) return console.error("Failed to fetch videos", res.status);
      const data = await res.json();
      setVideos(data.map((vid) => ({ ...vid, preview: vid.url })));
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  const addVideo = () => {
    if (!videoURL) return;
    const newVid = {
      id: `temp-${Date.now()}`,
      url: videoURL,
      preview: videoURL,
    };
    setVideos((prev) => [...prev, newVid]);
    setPendingChanges((prev) => ({
      ...prev,
      videos: { ...prev.videos, uploads: [...prev.videos.uploads, newVid] },
    }));
    setVideoURL("");
  };

  const deleteVideo = (id) => {
    const isTemp = id.startsWith("temp-");
    setPendingChanges((prev) => ({
      ...prev,
      videos: {
        uploads: isTemp
          ? prev.videos.uploads.filter((u) => u.id !== id)
          : prev.videos.uploads,
        deletions: isTemp
          ? prev.videos.deletions
          : [...prev.videos.deletions, id],
      },
    }));
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const saveVideos = async () => {
    try {
      // Delete videos
      for (const id of pendingChanges.videos.deletions) {
        await fetch(`${API_BASE}/api/youtube/${id}`, { method: "DELETE" });
      }

      // Add new videos
      for (const item of pendingChanges.videos.uploads) {
        await fetch(`${API_BASE}/api/youtube`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: item.url }),
        });
      }

      setPendingChanges({ videos: { uploads: [], deletions: [] } });
      fetchVideos();

      // ✅ Success alert
      setAlert({
        show: true,
        message: "Videos saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      // ❌ Error alert
      setAlert({
        show: true,
        message: "Failed to save videos.",
        type: "error",
      });
    }
  };

  const cancelChanges = () => {
    fetchVideos();
    setPendingChanges({ videos: { uploads: [], deletions: [] } });
    // ℹ️ Info alert
    setAlert({
      show: true,
      message: "Changes canceled.",
      type: "info",
    });
  };

  const hasChanges =
    pendingChanges.videos.uploads.length > 0 ||
    pendingChanges.videos.deletions.length > 0;

  // Convert YouTube URL to thumbnail
  const getThumbnail = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Input */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Paste YouTube URL"
          value={videoURL}
          onChange={(e) => setVideoURL(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-grow"
        />
        <button
          onClick={addVideo}
          className="bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 px-4 py-2 rounded-md flex items-center justify-center"
        >
          Add
        </button>
      </div>

      {/* Videos grid */}
      {videos.length === 0 ? (
        <div className="rounded-xl p-8 text-center border border-gray-200">
          <Youtube className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500 mb-4">No videos added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="border border-gray-200 rounded-lg overflow-hidden group relative"
            >
              <div className="aspect-video w-full overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={getThumbnail(video.preview)}
                  alt="YouTube thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Delete button */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="bg-red-600 text-white p-1 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Badges */}
              {pendingChanges.videos.uploads.some((u) => u.id === video.id) && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  New
                </div>
              )}
              {pendingChanges.videos.deletions.includes(video.id) && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  To be deleted
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save / Cancel */}
      <ActionButtons
        onSave={saveVideos}
        onCancel={cancelChanges}
        disabled={!hasChanges}
      />

      {/* Alert */}
      <Alert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </div>
  );
};

export default Videos;
