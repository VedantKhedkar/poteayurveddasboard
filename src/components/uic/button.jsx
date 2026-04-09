import React from "react";

const button = ({
  children,
  type = "button",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`w-full bg-gradient-to-br from-orange-300 to-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:from-orange-400 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default button;
