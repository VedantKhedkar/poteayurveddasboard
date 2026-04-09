import React, { useState } from "react";
import Help from "./Helpcenter.jsx";
import logo from "../../public/prpayurved.png";

import bizologo from "../assets/bizonance_logo.png";
import { LogOut, Menu, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    setShowConfirm(false);
    navigate("/");
  };

  return (
    <div className=" relative navbar flex items-center justify-between p-4 h-[80px]">
      <div className="flex items-center space-x-4">
        {/* Menu Icon to Toggle Sidebar */}
        <Menu
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          size={60}
          className={`hidden md:block rounded-full hover:bg-gray-200 h-10 w-10 p-2 cursor-pointer ${isSidebarOpen ? "bg-gray-100" : "bg-transparent"
            }`}
        />
        <div className="flex items-center">
          <img src={logo} alt="logo" width={50} height={50} className="mr-2" />
          <div className="flex flex-col">
            <div className="flex items-center  ">
              <span className=" text-orange-400 rounded text-xl font-bold">
                P. R. Pote Patil
              </span>
            </div>
            <span className="text-sm font-bold">College of Medical Sciences Ayurveda, Amravati.</span>
          </div>
        </div>
      </div>

      <div className="relative group inline-block">
        {/* Logo */}
        <img
          src={bizologo}
          alt="Bizo Logo"
          className="h-10 w-10 cursor-pointer rounded-full hover:ring-2 hover:ring-gray-300"
        />

        {/* Dropdown */}
        <div className="absolute -left-36 mt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <ul className="py-2 text-gray-700">
            <li
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <LogOut size={18} /> Logout
            </li>
            {/* <li
              onClick={() => navigate("/help")} // Navigate to Help page
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <HelpCircle size={18} /> Help Center
            </li> */}
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full flex h-[6px]">
        <div className="w-1/3 bg-gradient-to-r from-yellow-300 to-orange-400"></div>
        <div className="w-1/3 bg-blue-800"></div>
        <div className="w-1/3 bg-red-600"></div>
      </div>
    </div>
  );
};

export default Navbar;
