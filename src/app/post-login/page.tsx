'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Box, CircularProgress } from '@mui/material';

export default function PostLoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('user:', user);
    if (isLoading || !user) return;

    const roles = user['https://your-app.com/roles'] as string[] || [];
    console.log('roles:', roles);

    if (roles.includes('Admin')) {
      router.replace('/admin/certifications');
    } else if (roles.includes('PlantOperator')) {
      router.replace('/dashboards/dashboard');
    } else if (roles.length > 0) {
      router.replace('/unauthorized');
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
