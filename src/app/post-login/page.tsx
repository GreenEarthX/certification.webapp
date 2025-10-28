'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Box, CircularProgress } from '@mui/material';

export default function PostLoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;

    const roles = user['https://your-app.com/roles'] as string[] || [];

    if (roles.includes('Admin')) {
      router.replace('/admin/certifications');
      return;
    }

    if (roles.includes('PlantOperator')) {
      router.replace('/plant-operator/dashboard');
      return;
    }

    if (roles.length === 0) {
      // No roles — check if user profile is completed
      const checkProfile = async () => {
        try {
          const res = await fetch('/api/users/check-profile');
          const data = await res.json();

          if (data.needsCompletion) {
            router.replace('/user-registration'); // redirect to fill profile
          } else {
            router.replace('/plant-operator/dashboard'); // proceed
          }
        } catch (err) {
          console.error('Profile check failed:', err);
          router.replace('/unauthorized'); // fallback
        } finally {
          setChecking(false);
        }
      };

      checkProfile();
    }
  }, [user, isLoading, router]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
