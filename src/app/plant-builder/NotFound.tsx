import Link from "next/link"; // 1. Import Next.js Link
import { useEffect } from "react";
// Removed: import { useLocation } from "react-router-dom"; // Incompatible with Next.js App Router

const NotFound = () => {
  // 2. Simplifed useEffect, as the path is not from react-router-dom
  // Note: For a true 404 page in Next.js, you usually rely on the Next.js not-found file.
  // We'll keep the log simple for now.
  useEffect(() => {
    // console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    console.error("404 Error: User attempted to access a non-existent page.");
  }, []); // Empty dependency array as location is not used

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        
        {/* 3. Replaced <a> with <Link> to fix the Linter Error */}
        <Link 
          href="/" 
          className="text-blue-500 underline hover:text-blue-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;