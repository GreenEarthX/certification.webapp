'use client';
import React from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import dynamic from 'next/dynamic';
import 'react-phone-input-2/lib/style.css';
import Image from 'next/image';
import { useUserForm } from '@/hooks/useUserRegistration';
import { useRouter } from 'next/navigation';



const PhoneInput = dynamic(
  () => import('react-phone-input-2').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <TextField fullWidth label="Phone Number" margin="normal" size="small" />
    ),
  }
);

const PhoneNumberInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div style={{ marginTop: '16px', marginBottom: '8px' }}>
    <PhoneInput
      country={'us'}
      value={value}
      onChange={(phone) => onChange(phone)}
      inputStyle={{
        width: '100%',
        padding: '16.5px 14px 16.5px 58px',
        height: '40px',
      }}
      containerStyle={{ width: '100%' }}
    />
  </div>
);

const CountryInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const ReactFlagsSelect = dynamic(
    () => import('react-flags-select').then((mod) => mod.default),
    {
      ssr: false,
      loading: () => (
        <TextField fullWidth label="Country" margin="normal" size="small" />
      ),
    }
  );

  return (
    <Box
      sx={{
        mt: 1,
        mb: 1,
        '& .country-select': {
          width: '100%',
          '& button': {
            width: '100%',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            padding: '8px 14px',
            textAlign: 'left',
            minHeight: '40px',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      }}
    >
      <ReactFlagsSelect
        selected={value}
        onSelect={(code) => onChange(code)}
        searchable
        placeholder="Select Country"
        className="country-select"
        searchPlaceholder="Search countries"
      />
    </Box>
  );
};

const AddressInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <TextField
    fullWidth
    label="Address"
    variant="outlined"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    margin="normal"
    size="small"
  />
);

const UserRegistrationPage = () => {
  const {
    formData,
    handleChange,
    handleInputChange,
    handleSubmit,
  } = useUserForm();
  const router = useRouter();

  const isFormComplete =
  formData.firstName &&
  formData.lastName &&
  formData.company &&
  formData.position &&
  formData.email &&
  formData.phoneNumber &&
  formData.address &&
  formData.country &&
  formData.state &&
  formData.city &&
  formData.postalCode;


  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#fcfcf9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Image
            src="/logoGEX.png"
            alt="Logo"
            width={60}
            height={60}
            style={{ borderRadius: '50%' }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: '#2b91d3', fontWeight: 600 }}
        >
          Welcome to GEX Certification platform
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Let&apos;s simplify your certification journey together!
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PhoneNumberInput
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AddressInput
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CountryInput
                value={formData.country}
                onChange={handleChange('country')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!isFormComplete}
            sx={{
              borderRadius: '30px',
              paddingX: 2,
              paddingY: 0.5,
              fontSize: '1rem',
              minWidth: '100px',
            }}
          >
            Save
          </Button>

            <Button
              variant="contained"
              onClick={() => router.push('/plant-operator/dashboard')}
              sx={{
                borderRadius: '30px',
                paddingX: 2,
                paddingY: 0.5,
                fontSize: '1rem',
                minWidth: '100px',
                backgroundColor: '#64b5f6',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#42a5f5',
                },
              }}
            >
              Go to dashboard
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UserRegistrationPage;
