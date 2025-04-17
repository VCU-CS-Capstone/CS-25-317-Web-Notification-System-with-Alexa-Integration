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
    <div className="w-full">
      {/* Navbar */}
      <div className="navbar navbar-sticky bg-[var(--navbar-bg)] text-[var(--navbar-text)]">
        <div className="flex items-center justify-between w-full px-7 py-4">
          {/* Drawer Toggle Button (Small Screens) */}
          <button
            className="btn text-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] md:hidden hover:bg-slate-700"
            onClick={toggleDrawer}
          >
            ☰
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="font-bold text-3xl">
            RemindME
          </Link>

          {/* Navbar Links (Visible on Medium Screens and Larger) */}
          <div className="hidden md:flex gap-4 text-2xl font-bold">
            <Link href="/calendar" className="hover:text-blue-600 ">
              Calendar
            </Link>
            <Link href="/instructions" className="hover:text-blue-600 ">
              Help
            </Link>
            <Link href="/settings" className="hover:text-blue-600 ">
              Settings
            </Link>
            <Link href="/" className="hover:text-blue-600 ">
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Drawer and Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={closeDrawer} // Close drawer when backdrop is clicked
        >
          {/* Drawer Content */}
          <div
            className="fixed top-0 left-0 bg-[var(--bg-secondary)] w-72 h-full shadow-md z-50 pt-[env(safe-area-inset-top)] pl-4 pr-4 pb-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
          >
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] text-[var(--text-primary)] hover:bg-blue-600"
              onClick={closeDrawer}
            >
              ✕
            </button>
            <nav className="mt-8 flex flex-col gap-4">
              <Link
                href="/calendar"
                className="text-2xl 
                font-bold hover:text-blue-600 text-[var(--text-primary)]"
              >
                Calendar
              </Link>
              <Link 
                href="/instructions"
                className="text-2xl 
                font-bold hover:text-blue-600 text-[var(--text-primary)]"
              >
                Help
              </Link>
              <Link 
                href="/settings"
                className="text-2xl 
                font-bold hover:text-blue-600 text-[var(--text-primary)]"
              >
                Settings
              </Link>
              <Link
                href="/"
                className="text-2xl font-bold hover:text-blue-600 text-[var(--text-primary)]"
              >
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveNavbar;
