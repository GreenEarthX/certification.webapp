// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./styles/globals.css";

import AuthGuard from "../components/AuthGuard" 
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ← metadata stays here (server component = allowed)
export const metadata: Metadata = {
  title: "GreenEarthX Certification",
  description: "Hydrogen Certification Platform",
};

// ← RootLayout stays a server component (no "use client")
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-50`}>
        <Suspense fallback={null}>
          <AuthGuard />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
