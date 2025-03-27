"use client";
import React from "react";

interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
  okText?: string;
}

const Modal: React.FC<ModalProps> = ({ title, content, onClose, okText = "OK" }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{content}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {okText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
