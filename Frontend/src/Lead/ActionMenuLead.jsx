import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/styles/ActionMenu.css";

export default function ActionMenuLead({ onEdit, onEditStatut,  onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="menu-container" ref={menuRef}>
      <button className="menu-button" onClick={() => setOpen(!open)}>⋯</button>
      <AnimatePresence>
      {open && (
        <motion.div
            className="menu-list"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
       
          <div className="menu-item" onClick={onEdit}>Modifier</div>
          <div className="menu-item" onClick={onEditStatut}>Modifier le statut</div>
          <div className="menu-item delete" onClick={onDelete}>Supprimer</div>
        </motion.div>
       
      )}
      </AnimatePresence>
    </div>
  );
}
