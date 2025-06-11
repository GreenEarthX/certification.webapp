'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboards/recommendations');
    }, 3000); // simulate loading delay of 3s

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <img src="/logoGEX.png" alt="Logo" className="mx-auto h-12 mb-4" />
        <p className="text-blue-800 text-sm mb-4">Reviewing your recommendation list</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
