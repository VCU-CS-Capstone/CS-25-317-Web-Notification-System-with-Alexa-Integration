"use client"; // If this is in a Next.js environment with client-side interactivity

import Link from "next/link";
import React, { useState, useEffect } from "react";

const ResponsiveNavbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Automatically close the drawer on medium and larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false); // Close drawer on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="  p-8">
      {/* Navbar */}
      <div className="navbar navbar-sticky   bg-[#73FF00] text-black ">
        <div className="flex items-center justify-between w-full">
          {/* Drawer Toggle Button (Small Screens) */}
          <button
            className="btn text-lg btn-primary md:hidden"
            onClick={toggleDrawer}
          >
            ☰
          </button>

          {/* Logo */}
          <a href="/" className="font-bold text-lg">
            RemindME
          </a>

          {/* Navbar Links (Visible on Medium Screens and Larger) */}
          <div className="hidden md:flex gap-4">
            <Link href="/calender" className="hover:underline">
              Calendar
            </Link>
            <Link href="/instructions" className="hover:underline">
              Help
            </Link>
            <Link href="#signin" className="hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Drawer and Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black  bg-opacity-50 z-50"
          onClick={closeDrawer} // Close drawer when backdrop is clicked
        >
          {/* Drawer Content */}
          <div
            className="fixed top-0 left-0 bg-[#73FF00]  w-72 h-full shadow-md z-50 p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
          >
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-black"
              onClick={closeDrawer}
            >
              ✕
            </button>
            <nav className="mt-8 flex flex-col gap-4">
              <a
                href="#calendar"
                className="text-lg hover:text-blue-600 text-black"
              >
                Calendar
              </a>
              <a
                href="#help"
                className="text-lg hover:text-blue-600 text-black"
              >
                Help
              </a>
              <a
                href="#signin"
                className="text-lg hover:text-blue-600 text-black"
              >
                Sign In
              </a>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveNavbar;
