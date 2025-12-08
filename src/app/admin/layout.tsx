import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../styles/globals.css";

import Sidebar from "@/components/admin/layout/admin-sidebar/Sidebar";
import Navbar from "@/components/admin/layout/admin-navbar/Navbar";

// Font setup (optional here since it's already global, but fine if needed)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard layout",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex w-full h-full bg-blue-50`}>
      <Sidebar />
      <div className="flex flex-col w-full p-6">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
