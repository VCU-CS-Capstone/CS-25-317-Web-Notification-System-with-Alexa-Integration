import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Link from 'next/link'; // Link component for navigation

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Next.js App</title>
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/instructions">Instructions</Link></li>
              <li>Contact</li>
            </ul>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}