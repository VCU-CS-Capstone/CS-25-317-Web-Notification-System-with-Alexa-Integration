// /app/components/LayoutWrapper.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/"; // Hide only on home page

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
