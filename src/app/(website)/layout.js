import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ContactUs from "@/components/ContactUs";
import ResponsiveMenuBar from "@/components/ResponsiveMenuBar";
import ClientOnly from "@/components/ClientOnly";

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="md:top-[23px] top-[24px] z-50">
        <ClientOnly>
          <ResponsiveMenuBar />
        </ClientOnly>
      </header>

      {/* Page Content */}
      <main className="">{children}</main>

      <ContactUs />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto flex md:flex-row flex-col md:gap-1 gap-4 items-center justify-between">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <ClientOnly>
            <p>&copy; Copyright ThinQ Chess {new Date().getFullYear()}</p>
          </ClientOnly>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
        </div>
      </footer>
    </div>
  );
}
