import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Image as ImageIcon,
  FileText,
  Calendar,
  Video as VideoIcon,
  BookOpen,
  Users,
  X,
} from "lucide-react";

// Import all separated components
import ContactInfo from "./home-sections/ContactInfo";
import SimpleImageManager from "./home-sections/SimpleImageManager";
import NewsNoticesDashboard from "./home-sections/NewsNoticesDashboard";
import UpcomingEvents from "./home-sections/UpcomingEvents";
import HighlightedEvents from "./home-sections/HighlightedEvents";
import VideoGallery from "./home-sections/VideoGallery";
import OurInstitutes from "./home-sections/OurInstitutes";
import OurInspiration from "./home-sections/OurInspiration";

const HomeDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const sections = [

    {
      id: "home-slider",
      title: "Home Slider Images",
      icon: <ImageIcon size={20} />,
      stats: "Manage homepage slider",
      action: "Manage slider images",
      content: <SimpleImageManager onClose={() => setIsEditing(false)} />,
    },


    {
      id: "news-notices",
      title: "News & Notices",
      icon: <FileText size={20} />,
      stats: "Manage news and notices",
      action: "Manage news & notices",
      content: <NewsNoticesDashboard />,
    },
    {
      id: "our-inspiration",
      title: "Our Inspiration, Pillers and Principal",
      icon: <Users size={20} />,
      stats: "Manage leadership profiles",
      action: "Manage leadership",
      content: <OurInspiration />,
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <Settings size={20} />,
      stats: "Edit contact details",
      action: "Update contact info",
      content: <ContactInfo onCancel={() => setIsEditing(false)} />,
    },

    {
      id: "upcoming-events",
      title: "Upcoming Events",
      icon: <Calendar size={20} />,
      stats: "Manage academic events",
      action: "Manage events",
      content: <UpcomingEvents />,
    },
    {
      id: "highlighted-events",
      title: "Highlighted Events",
      icon: <Calendar size={20} />,
      stats: "Manage academic events",
      action: "Manage events",
      content: <HighlightedEvents />,
    },
    {
      id: "image-video-gallery",
      title: "Image And Video Gallery",
      icon: <VideoIcon size={20} />,
      stats: "Manage image and video collection",
      action: "Manage image and videos",
      content: <VideoGallery />,
    },
    {
      id: "Other-institutes",
      title: "Other Institutes",
      icon: <BookOpen size={20} />,
      stats: "Manage institutes and centers",
      action: "Manage institutes",
      content: <OurInstitutes />,
    },

  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-xl font-semibold text-gray-800">
            Home Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Manage your homepage content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-6 cursor-pointer group"
              whileHover={{ y: -5 }}
              onClick={() => {
                setActiveSection(section.id);
                setIsEditing(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 p-3 rounded-xl mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-sm font-medium text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{section.stats}</p>
                <div className="mt-4 flex items-center text-sm text-orange-600 font-medium">
                  <span>{section.action}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isEditing && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-40 z-30"
                onClick={() => setIsEditing(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl"
              >
                <div className="h-full flex flex-col">
                  <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {sections.find((s) => s.id === activeSection)?.title}
                    </h2>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-6">
                    {sections.find((s) => s.id === activeSection)?.content}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomeDashboard;
