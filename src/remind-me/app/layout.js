import localFont from "next/font/local";
import LayoutWrapper from "./components/LayoutWrapper";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Built-in metadata support for Next.js App Router
export const metadata = {
  title: "Remind Me",
  description: "Smart reminders with push notifications and Alexa integration.",
  themeColor: "#73FF00",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
    shortcut: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Remind Me",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Script to apply color mode before page renders to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Apply color mode
                const colorMode = localStorage.getItem('colorMode') || '';
                document.documentElement.classList.remove('light', 'dark');
                if (colorMode) {
                  document.documentElement.classList.add(colorMode);
                }
                
                // Apply font size - important for ensuring consistent sizing
                const fontSize = localStorage.getItem('fontSize') || 'medium';
                document.documentElement.setAttribute('data-font-size', fontSize);
                
                // Set the color-scheme meta tag based on the theme
                // Both default (empty) and 'light' (purple & cream) are light themes
                const isDarkMode = colorMode === 'dark';
                const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
                
                if (metaColorScheme) {
                  metaColorScheme.content = isDarkMode ? 'dark' : 'light';
                } else {
                  const meta = document.createElement('meta');
                  meta.name = 'color-scheme';
                  meta.content = isDarkMode ? 'dark' : 'light';
                  document.head.appendChild(meta);
                }
              } catch (e) {
                console.error('Error applying theme settings:', e);
              }
            })();
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden`}>
        <SettingsProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SettingsProvider>
      </body>
    </html>
  );
}
