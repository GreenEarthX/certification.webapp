import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/plant-operator/layout/navbar/Navbar";

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
  title: "Plant Builder",
  description: "Plant Builder layout",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased w-full min-h-screen bg-blue-50 flex flex-col`}
    >
      <Navbar />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
