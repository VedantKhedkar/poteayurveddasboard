"use client";
import React from "react";

const deletemodal = ({
  show,
  message = "Are you sure?",
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{message}</h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="bg-gray-200 flex-1 px-4 py-2 rounded"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 flex-1 text-white px-4 py-2 rounded"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default deletemodal;
