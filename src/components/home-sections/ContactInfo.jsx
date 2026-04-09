import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Globe, Loader2, Save, X } from "lucide-react";

const ContactInfo = ({ onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    alternate_phone: "",
    email: "",
    map_link: "",
    facebook: "",
    instagram: "",
    youtube: "",
    google: "",
    whatsapp: "",
  });

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const res = await fetch("/api/contact");

      const data = await res.json();
      if (data) {
        setContact({
          id: data.id,
          address: data.address || "",

          phone: data.phone || "",
          alternate_phone: data.alternatePhone || "",
          email: data.email || "",
          map_link: data.mapLink || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          google: data.google || "",
          whatsapp: data.whatsapp || "",
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching contact:", error);
      setLoading(false);
    }
  };

  // --- HELPER: Convert normal Maps URL to Embed URL ---
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) return url;

    // Convert shared links or search terms to embed format
    return `https://www.google.com/maps/embed?pb=!1m19!1m8!1m3!1d2752356.2737303916!2d77.40447362870799!3d21.10455131255441!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x3bd6a3cce787b24b%3A0xf1543ac4ccc91521!2sXQP5%2BGF2%20P.R.%20Pote%20Patil%20College%20of%20Medical%20Sciences%20Ayurved%2C%20Pote%20Estate%2C%20Kathora%20Rd%2C%20Mu%2C%20Kathora%2C%20Amravati%2C%20Maharashtra%20444604!3m2!1d20.9862949!2d77.7585902!5e0!3m2!1sen!2sin!4v1765190528377!5m2!1sen!2sin{encodeURIComponent(url)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  // --- 2. SAVE DATA TO BACKEND ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.log("Backend error:", errData);
        throw new Error("Failed to save");
      }

      alert("Contact updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving contact info");
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">
          Fetching details from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Contact Details Section */}
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Basic Information
        </h3>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <MapPin className="mr-2 text-orange-500" size={16} /> Institute
            Address
          </label>
          <textarea
            rows="2"
            value={contact.address || ""}
            onChange={(e) =>
              setContact({ ...contact, address: e.target.value })
            }

            placeholder="Enter complete address..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Phone className="mr-2 text-green-500" size={16} /> Phone Number
            </label>
            <input
              type="text"
              value={contact.phone || ""}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="e.g. 0721-2970111"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {/* Alternate Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Phone className="mr-2 text-teal-500" size={16} /> Alternate
              Number
            </label>
            <input
              type="text"
              value={contact.alternate_phone || ""}
              onChange={(e) =>
                setContact({ ...contact, alternate_phone: e.target.value })
              }
              placeholder="Optional alternate number"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Mail className="mr-2 text-blue-500" size={16} /> Official Email ID
          </label>
          <input
            type="email"
            value={contact.email || ""}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="e.g. info@college.com"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Map Link */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <MapPin className="mr-2 text-red-500" size={16} /> Google Map URL
          </label>
          <input
            type="text"
            value={contact.map_link || ""}
            onChange={(e) =>
              setContact({ ...contact, map_link: e.target.value })
            }
            placeholder="Paste Google Maps link here"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="mt-2 text-[10px] text-gray-400 italic">
            Tip: You can paste the link from your browser's address bar.
          </p>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
          <Globe className="mr-2" size={14} /> Social Media Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["facebook", "whatsapp", "instagram", "youtube", "google"].map(
            (key) => (
              <div key={key}>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5 ml-1">
                  {key}
                </label>
                <input
                  type="text"
                  placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                  value={contact[key] || ""}
                  onChange={(e) =>
                    setContact({ ...contact, [key]: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Form Buttons - Sticky Bottom */}
      <div className="flex gap-3 pt-6 border-t mt-auto sticky bottom-0 bg-white/90 backdrop-blur-sm pb-4">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <X size={18} /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;
