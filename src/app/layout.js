import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "react-phone-input-2/lib/style.css";
import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Optimized font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// Import components normally for layout
import CustomCursor from "@/components/ui/CustomCursor";
import ContactUs from "@/components/ContactUs";
import ResponsiveMenuBar from "@/components/ResponsiveMenuBar";
import ClientOnly from "@/components/ClientOnly";
import ThemeRegistry from "@/components/ThemeRegistry";
import RouterOptimizer from "@/components/RouterOptimizer";

export const metadata = {
  title: "ThinQ Chess",
  description: "ThinQ Chess Academy - Learn Chess from Expert Coaches",
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: '32x32' },
      { url: '/favicon.ico', sizes: '16x16' }
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "ThinQ Chess Academy",
    description: "Learn Chess from Expert Coaches",
    url: "https://thinqchess.com",
    siteName: "ThinQ Chess Academy",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "ThinQ Chess Academy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

// Performance monitoring
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    // Send to analytics service
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    // });
  }
}



export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Fonts & Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />

        {/* Basic Metadata */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Join ThinQ Chess to sharpen your mind through engaging chess programs for all ages!"
        />

        {/* Open Graph Metadata */}
        <meta property="og:title" content="ThinQ Chess" />
        <meta
          property="og:description"
          content="Join ThinQ Chess to sharpen your mind through engaging chess programs for all ages!"
        />
        <meta
          property="og:image"
          content="https://thinqchess.com/images/favicon.png"
        />
        <meta property="og:url" content="https://thinqchess.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Preview (optional) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ThinQ Chess" />
        <meta
          name="twitter:description"
          content="Join ThinQ Chess to sharpen your mind through engaging chess programs for all ages!"
        />
        <meta
          name="twitter:image"
          content="https://thinqchess.com/images/favicon.png"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <ThemeRegistry>
          {/* <RouterOptimizer /> */}
          {/* Custom Cursor - Temporarily disabled for testing */}
          {/* <span className="max-md:hidden">
            <ClientOnly>
              <CustomCursor />
            </ClientOnly>
          </span> */}

          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
