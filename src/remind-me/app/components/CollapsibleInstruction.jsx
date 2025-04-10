"use client";

import React, { useState } from 'react';

const CollapsibleInstruction = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4">
      <div 
        className="p-4 bg-blue-600 text-white rounded-lg cursor-pointer"
        onClick={toggle}
      >
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {isOpen && (
        <div className="p-4 mt-2 bg-gray-200 text-gray-800 rounded-lg">
          {children}
        </div>
      )}
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
