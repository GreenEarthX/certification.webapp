'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostSignupPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Syncing your account...");

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        const user = await res.json();

        if (!res.ok || !user?.email || !user?.auth0sub) {
          setStatus("❌ Failed to load session.");
          return;
        }

        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            auth0Sub: user.auth0sub,
          }),
        });

        const result = await signupRes.json();
        console.log("Signup result:", result);

        if (signupRes.status === 201) {
          setStatus("✅ User registered successfully!");
        } else if (signupRes.status === 200 && result.message === "User already exists") {
          setStatus("✅ User already registered.");
        } else {
          setStatus("❌ Registration failed.");
          return;
        }

        setTimeout(() => {
          router.push('/api/auth/login');
        }, 2500);

      } catch (err) {
        console.error("Error during sync:", err);
        setStatus("❌ Sync failed.");
      }
    };

    syncUser();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-xl font-semibold">{status}</h1>
      <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
    </div>
  );
}
