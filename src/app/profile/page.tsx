'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Paper,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';


export default function Home() {
  const { user, isLoading, error } = useUser();
  
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/users/me');
        if (res.status === 404) {
          // 🚨 User not in DB → redirect to post-signup
          window.location.href = '/post-signup';
        } else {
          // ✅ User exists
          setChecking(false);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setChecking(false);
      }
    };

    checkUser();
  }, [user]);


  if (isLoading || checking) {
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }


  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Error: {error.message}</Alert>
      </Container>
    );
  }

  const roles = user?.['https://your-app.com/roles'] as string[] | undefined;

  const handleDashboardRedirect = () => {
    if (roles?.includes('Admin')) {
      window.location.href = '/admin/dashboard';
    } else if (roles?.includes('PlantOperator')) {
      window.location.href = '/plant-operator/dashboard';
    } else {
      window.location.href = '/unauthorized';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Portal
        </Typography>

        {user ? (
          <>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={user.picture ?? undefined}
                alt={user.name ?? 'User'}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Role(s):</strong> {roles?.join(', ') || 'None'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>Email Verified:</strong>{' '}
              {user.email_verified ? 'Yes' : 'No'}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDashboardRedirect}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => (window.location.href = '/api/auth/logout')}
              >
                Logout
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are not logged in.
            </Typography>
            <Button
              variant="contained"
              onClick={() => (window.location.href = '/api/auth/login')}
            >
              Login
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
