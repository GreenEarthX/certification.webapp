'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      const res = await fetch('/api/users/check-profile');
      const data = await res.json();

      if (data.needsCompletion) {
        router.push('/userRegistration');
      } else {
        router.push('/dashboards/dashboard'); // or wherever
      }
    }

    checkProfile();
  }, []);

  return <p>Loading...</p>;
}
