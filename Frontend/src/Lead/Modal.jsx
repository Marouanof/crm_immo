// Modal.jsx
import React from "react";
import "../assets/styles/modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-none">
        <button className="btn-close" onClick={onClose}></button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
