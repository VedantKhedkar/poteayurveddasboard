"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  HomeIcon,
  CircleHelp,
  Info,
  Hospital,
  NotebookText,
  BookOpenText,
  Link,
  FileCheck,
  User,
  ShieldCheck,
  PlusCircle,
  School, // <-- Added School icon for University Details
  GraduationCap
} from "lucide-react";

import Home from "./home.jsx";
import Help from "./Helpcenter.jsx";
import CardManager from "./Administration.jsx";
import PrincipalManager from "./PrincipalDetails.jsx";
import UniversityDetails from "./UniversityDetails.jsx"; // <-- Added import for University Details
import HospitalTab from "./Hospital-Tab.jsx";
import NCISM from "./NCISM-Mandate.jsx";
import MUHS from "./MUHS-Mandate.jsx";
import Departments from "./Departments.jsx";
import CommitteesCell from "./Committees-Cell.jsx";
import ImportantLinks from "./Important-Link.jsx";
import Addmission from "./Addmission.jsx";
import NewComponent from "./New.jsx";
import Academic from "./Academic.jsx";

const sidebarItems = [
  { title: "Home", Icon: HomeIcon, Content: Home },
  {
    title: "About",
    Icon: Info,
    children: [
      { title: "Administration Desk", Icon: User, Content: CardManager },
      { title: "Principal Details", Icon: User, Content: PrincipalManager },
      { title: "University Details", Icon: School, Content: UniversityDetails }, // <-- Added University Details step-by-step here
    ],
  },
  { title: "Hospital", Icon: Hospital, Content: HospitalTab },
  { title: "NCISM Mandate", Icon: NotebookText, Content: NCISM },
  { title: "MUHS Mandate", Icon: NotebookText, Content: MUHS },
  { title: "Departments", Icon: BookOpenText, Content: Departments },
  { title: "Committees/Cell", Icon: Users, Content: CommitteesCell },
  { title: "Academics", Icon: GraduationCap, Content: Academic },

  // Renamed from "New Updates" to "Administration Updates" to avoid conflict with the About > Administration tab
  { title: "Administration", Icon: PlusCircle, Content: NewComponent },

  { title: "Imp Links", Icon: Link, Content: ImportantLinks },
  { title: "Addmission", Icon: FileCheck, Content: Addmission },
  { title: "Help Center", Icon: CircleHelp, Content: Help },
];

function Sidebar({ isOpen: propIsOpen }) {
  const [activeContent, setActiveContent] = useState("Home");
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) setIsOpen(propIsOpen);
  }, [propIsOpen, isMobile]);

  useEffect(() => {
    sidebarItems.forEach((item) => {
      if (item.children?.some((c) => c.title === activeContent)) {
        setExpandedGroups((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [activeContent]);

  const getContent = (title) => {
    for (const item of sidebarItems) {
      if (item.title === title && item.Content) {
        return <item.Content setActiveContent={setActiveContent} />;
      }
      if (item.children) {
        const child = item.children.find((c) => c.title === title);
        if (child) {
          return <child.Content setActiveContent={setActiveContent} />;
        }
      }
    }
    return null;
  };

  const renderSidebarButton = (item, index, isChild = false) => {
    const isActive = activeContent === item.title;
    const isGroup = item.children;
    const isExpanded = expandedGroups[item.title];

    return (
      <motion.div
        key={index}
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={() => {
            if (isGroup) {
              setExpandedGroups((p) => ({
                ...p,
                [item.title]: !p[item.title],
              }));
            } else {
              setActiveContent(item.title);
              if (isMobile) setIsOpen(false);
            }
          }}
          className={`flex items-center max-w-full w-56 py-2 px-4 text-sm rounded-r-full transition-colors ${
            isActive
              ? "bg-blue-400/30 text-blue-950"
              : "text-gray-700 hover:bg-gray-200"
          } ${isOpen ? "justify-start space-x-2" : "justify-center"} ${
            isChild ? "pl-8" : ""
          }`}
        >
          <item.Icon className="w-4 h-4 shrink-0" />

          {isOpen && (
            <>
              <span className="flex-1 font-medium text-left whitespace-nowrap">
                {item.title}
              </span>
              {isGroup && (
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl"
                >
                  ▸
                </motion.span>
              )}
            </>
          )}
        </button>
      </motion.div>
    );
  };

  const renderMobileTab = (item, index) => {
    const isActive = activeContent === item.title;

    return (
      <motion.div key={index} className="flex-shrink-0 px-2">
        <button
          onClick={() => setActiveContent(item.title)}
          className={`flex flex-col items-center py-2 ${
            isActive ? "text-blue-800" : "text-gray-500"
          }`}
        >
          <item.Icon className="w-5 h-5 mb-1" />
          <span className="text-xs truncate max-w-[4rem]">{item.title}</span>
        </button>
      </motion.div>
    );
  };

  return (
    <div className="relative h-full">
      {!isMobile && (
        <div className="flex h-[calc(100vh-5rem)]">
          <motion.div
            className="flex flex-col bg-white shadow-md pt-8 overflow-y-auto no-scrollbar"
            animate={{ width: isOpen ? "16rem" : "5rem" }}
          >
            {sidebarItems.map((item, index) =>
              item.children ? (
                <div key={index}>
                  {renderSidebarButton(item, index)}

                  <AnimatePresence>
                    {expandedGroups[item.title] &&
                      isOpen &&
                      item.children.map((child, cIndex) => (
                        <motion.div
                          key={`${index}-${cIndex}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {renderSidebarButton(
                            child,
                            `${index}-${cIndex}`,
                            true
                          )}
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              ) : (
                renderSidebarButton(item, index)
              )
            )}
          </motion.div>

          <div className="flex-1 overflow-y-auto bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {getContent(activeContent)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto pb-16">
            {getContent(activeContent)}
          </div>

          <motion.div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
            <div className="flex overflow-x-auto no-scrollbar">
              {sidebarItems
                .flatMap((i) => (i.children ? i.children : i))
                .map((item, index) => renderMobileTab(item, index))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;