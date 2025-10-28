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
        router.push('/user-registration');
      } else {
        router.push('/plant-operator/dashboard');
      }
    }

    checkProfile();
  }, []);

  return <p>Loading...</p>;
}
