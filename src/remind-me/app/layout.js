import localFont from "next/font/local";
import LayoutWrapper from "./components/LayoutWrapper";
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

// ✅ Built-in metadata support for Next.js App Router
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
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
