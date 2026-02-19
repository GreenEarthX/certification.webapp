'use client';

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
  TextField,
  Chip,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { clearTokens, getToken } from '@/lib/shared-auth';
import { fetchUser } from '@/services/users/fetchUserAPI';
import { submitUserProfile } from '@/services/users/fetchUserAPI';
import type { User } from '@/models/user';
import Navbar from '@/components/plant-operator/layout/navbar/Navbar';

type SessionPayload = {
  userId?: string;
  sub?: string;
  authId?: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  verified?: boolean;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    phoneNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();
      if (!token) {
        setError('You are not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const payloadPart = token.split('.')[1];
        const payload = payloadPart ? JSON.parse(atob(payloadPart)) : null;
        setSession(payload);
        const user = await fetchUser();
        if (!user) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        setProfile(user);
        setFormData({
          firstName: user.first_name ?? '',
          lastName: user.last_name ?? '',
          company: user.company ?? '',
          position: user.position ?? '',
          phoneNumber: user.phone_number ?? '',
          address: user.address?.street ?? '',
          country: user.address?.country ?? '',
          state: user.address?.state ?? '',
          city: user.address?.city ?? '',
          postalCode: user.address?.postal_code ?? '',
        });
        setError(null);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);


  const roles = useMemo(() => {
    const fromProfile = profile?.user_role ? [profile.user_role] : [];
    const fromSession = session?.permissions && Array.isArray(session.permissions)
      ? session.permissions
      : session?.role
        ? [session.role]
        : [];
    return Array.from(new Set([...fromProfile, ...fromSession]));
  }, [profile?.user_role, session]);

  const displayName = useMemo(() => {
    const fullName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || session?.name || profile?.email || session?.email || 'User';
  }, [profile?.first_name, profile?.last_name, profile?.email, session?.name, session?.email]);

  const initials = useMemo(() => {
    const source = displayName || '';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [displayName]);

  const email = profile?.email || session?.email || '—';
  const verified = session?.verified === true ? 'Yes' : 'No';
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleString()
    : '—';

  const addressLine = profile?.address?.street || '—';
  const cityLine = [
    profile?.address?.city,
    profile?.address?.state,
    profile?.address?.postal_code,
  ]
    .filter(Boolean)
    .join(', ') || '—';
  const countryLine = profile?.address?.country || '—';

  const normalizedRoles = useMemo(
    () =>
      roles.map((role) =>
        role.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '')
      ),
    [roles]
  );

  const handleFormChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const ok = await submitUserProfile(formData);
      if (!ok) {
        setError('Failed to save profile.');
        return;
      }
      const refreshed = await fetchUser();
      if (refreshed) {
        setProfile(refreshed);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <Box
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">Error: {error}</Alert>
        </Container>
      </div>
    );
  }

  const handleDashboardRedirect = () => {
    window.location.href = '/plant-operator/dashboard';
  };

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value || '—'}
      </Typography>
    </Box>
  );

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            background:
              'linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #f1f5f9 100%)',
          }}
        >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={3}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              alt={displayName}
              sx={{ width: 84, height: 84, bgcolor: '#1d4ed8', fontSize: 28 }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a">
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.position || '—'} {profile?.company ? `· ${profile.company}` : ''}
              </Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsEditing(false)}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  onClick={handleSaveProfile}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsEditing(true)}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Edit Profile
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleDashboardRedirect}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                clearTokens();
                window.location.href = '/';
              }}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {isEditing ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 260 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Personal
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleFormChange('firstName')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleFormChange('lastName')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Position"
                    value={formData.position}
                    onChange={handleFormChange('position')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Company"
                    value={formData.company}
                    onChange={handleFormChange('company')}
                  />
                </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 260 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone"
                    value={formData.phoneNumber}
                    onChange={handleFormChange('phoneNumber')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Address"
                    value={formData.address}
                    onChange={handleFormChange('address')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={formData.city}
                    onChange={handleFormChange('city')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="State"
                    value={formData.state}
                    onChange={handleFormChange('state')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={handleFormChange('postalCode')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Country"
                    value={formData.country}
                    onChange={handleFormChange('country')}
                  />
                </Stack>
            </Paper>
            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 200 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Role:</strong> {roles.length ? roles.join(', ') : '—'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Auth ID:</strong> {profile?.auth0sub ?? session?.userId ?? '—'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created At:</strong> {createdAt}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 260 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Personal
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  <InfoRow label="First Name" value={profile?.first_name ?? undefined} />
                  <InfoRow label="Last Name" value={profile?.last_name ?? undefined} />
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                      {roles.length ? (
                        roles.map((role) => (
                          <Chip key={role} size="small" label={role} />
                        ))
                      ) : (
                        <Chip size="small" label="—" />
                      )}
                    </Stack>
                  </Box>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Email Verified
                    </Typography>
                    <Chip
                      size="small"
                      label={verified}
                      color={verified === 'Yes' ? 'success' : 'default'}
                    />
                  </Box>
                </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 260 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  <InfoRow label="Email" value={email} />
                  <InfoRow label="Phone" value={profile?.phone_number ?? undefined} />
                  <InfoRow label="Address" value={addressLine} />
                  <InfoRow label="City/State" value={cityLine} />
                  <InfoRow label="Country" value={countryLine} />
                </Stack>
            </Paper>
            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff', minHeight: 200 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  <InfoRow label="User ID" value={profile?.user_id?.toString()} />
                  <InfoRow label="Auth ID" value={profile?.auth0sub ?? session?.userId} />
                  <InfoRow label="Created At" value={createdAt} />
                </Stack>
              </Paper>
            </Box>
          </Box>
        )}
        </Paper>
      </Container>
    </div>
  );
}
