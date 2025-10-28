'use client';

import { useEffect, useState } from 'react';

export default function AuthSync() {
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
          console.warn('User not authenticated');
          return;
        }

        const user = await res.json();

        if (!user?.email || !user?.auth0sub) {
          console.warn('Missing email or sub:', user);
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
        console.log('Signup result:', result);
        setHasSynced(true);
      } catch (err) {
        console.error('Error syncing user:', err);
      }
    };

    if (!hasSynced) {
      syncUser();
    }
  }, [hasSynced]);

  return null;
}
