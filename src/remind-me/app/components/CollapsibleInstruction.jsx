"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CollapsibleInstruction = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4">
      <motion.div 
        className="p-4 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-lg cursor-pointer transition-all duration-300 hover:bg-[var(--accent-color-hover)]"
        onClick={toggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div 
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="p-4 mt-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Might add for Website shortcut since there is a difference between Windows users and macbook users (a smaller drop down within the dropdown)

//const CollapsibleMiniInstruction = ({ title, children }) => { 
  //const [isOpen, setIsOpen] = useState(false);

  //const toggle = () => setIsOpen(!isOpen);

  //return (
    //<div className="mb"
  //)
//}

export default CollapsibleInstruction;
