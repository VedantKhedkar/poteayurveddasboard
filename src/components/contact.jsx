"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Globe, X } from "lucide-react";
import ActionButtons from "./uic/ActionButtons";
import Alert from "./uic/Alert";

const ContactPage = () => {
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [contact, setContact] = useState({
    address: ["", ""],
    phoneone: "",
    phonetwo: "",
    email: "",
    social: { facebook: "", instagram: "", youtube: "", google: "", linkedin: "", twitter: "", whatsapp: "", thread: "" },
    apps: { playStore: "", appStore: "" },
  });
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const res = await fetch("https://api.jarayuayurved.com/api/contact");
      const data = await res.json();

      if (data && data.length > 0) {
        const contactData = data[0];
        setContact({
          address: [contactData.address?.[0] || "", contactData.address?.[1] || ""],
          phoneone: contactData.phoneone || "",
          phonetwo: contactData.phonetwo || "",
          email: contactData.email || "",
          social: {
            facebook: contactData.facebook || "",
            instagram: contactData.instagram || "",
            youtube: contactData.youtube || "",
            google: contactData.google || "",
            linkedin: contactData.linkedin || "",
            twitter: contactData.twitter || "",
            whatsapp: contactData.whatsapp || "",
            thread: contactData.thread || "",
          },
          apps: { playStore: contactData.playStore || "", appStore: contactData.appStore || "" },
        });
      }
    } catch (err) {
      console.error("Failed to fetch contact info", err);
      setAlert({ show: true, message: "Failed to load contact info", type: "error" });
    }
  };

  const saveContactInfo = async () => {
    const payload = {
      address: contact.address,
      phoneone: contact.phoneone,
      phonetwo: contact.phonetwo,
      email: contact.email,
      facebook: contact.social.facebook,
      instagram: contact.social.instagram,
      youtube: contact.social.youtube,
      google: contact.social.google,
      linkedin: contact.social.linkedin,
      twitter: contact.social.twitter,
      whatsapp: contact.social.whatsapp,
      thread: contact.social.thread,
    };

    try {
      const res = await fetch(
        "https://api.jarayuayurved.com/api/contact/51084acd-baa2-4805-b430-a8af54f72a19",
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );

      if (res.ok) {
        setAlert({ show: true, message: "Contact updated successfully!", type: "success" });
        setPendingChanges(false);
        fetchContactInfo();
        setIsEditing(false);
      } else throw new Error("Failed to save contact info");
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: "Failed to save contact info", type: "error" });
    }
  };

  const cancelChanges = () => {
    fetchContactInfo();
    setPendingChanges(false);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Contact Information</h1>
          {isEditing && (
            <button onClick={cancelChanges} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Two-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Line 1 */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="mr-2" size={16} /> Clinic Address 1
            </label>
            <input
              type="text"
              value={contact.address[0]}
              onChange={(e) => {
                const updated = [...contact.address];
                updated[0] = e.target.value;
                setContact({ ...contact, address: updated });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="mr-2" size={16} /> Clinic Address 2
            </label>
            <input
              type="text"
              value={contact.address[1]}
              onChange={(e) => {
                const updated = [...contact.address];
                updated[1] = e.target.value;
                setContact({ ...contact, address: updated });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="mr-2" size={16} /> Phone Number
            </label>
            <input
              type="text"
              value={contact.phoneone}
              maxLength={10}
              onChange={(e) => {
                setContact({ ...contact, phoneone: e.target.value });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="mr-2" size={16} /> Alternate Number
            </label>
            <input
              type="text"
              value={contact.phonetwo}
              maxLength={10}
              onChange={(e) => {
                setContact({ ...contact, phonetwo: e.target.value });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="mr-2" size={16} /> Email
            </label>
            <input
              type="text"
              value={contact.email}
              onChange={(e) => {
                setContact({ ...contact, email: e.target.value });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Facebook
            </label>
            <input
              type="text"
              value={contact.social.facebook}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, facebook: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Instagram
            </label>
            <input
              type="text"
              value={contact.social.instagram}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> YouTube
            </label>
            <input
              type="text"
              value={contact.social.youtube}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, youtube: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Google */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Google
            </label>
            <input
              type="text"
              value={contact.social.google}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, google: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {/* Linkedin */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Linkedin
            </label>
            <input
              type="text"
              value={contact.social.linkedin}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, linkedin: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {/* Twitter */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Twitter
            </label>
            <input
              type="text"
              value={contact.social.twitter}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, twitter: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {/* Thread */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Thread
            </label>
            <input
              type="text"
              value={contact.social.thread}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, thread: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {/* Whatsapp */}
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="mr-2" size={16} /> Whatsapp
            </label>
            <input
              type="text"
              value={contact.social.whatsapp}
              onChange={(e) => {
                setContact({ ...contact, social: { ...contact.social, whatsapp: e.target.value } });
                setPendingChanges(true);
                setIsEditing(true);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Save / Cancel Buttons */}
        <div className="mt-6">
          <ActionButtons onSave={saveContactInfo} onCancel={cancelChanges} disabled={!pendingChanges} />
        </div>
      </div>

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

export default ContactPage;
