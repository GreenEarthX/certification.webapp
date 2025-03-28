'use client';
import React from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container,
  Grid,
  Paper
} from '@mui/material';
import dynamic from 'next/dynamic';
import 'react-phone-input-2/lib/style.css';
import Image from 'next/image';

// PhoneNumber component (exactly like your initial implementation)
const PhoneNumberInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
      <PhoneInput
        country={'us'}
        value={value}
        onChange={(phone) => onChange(phone)}
        inputStyle={{ 
          width: '100%', 
          padding: '16.5px 14px 16.5px 58px',
          height: '40px'
        }}
        containerStyle={{ width: '100%' }}
      />
    </div>
  );
};

// Dynamically import PhoneInput with no SSR (moved here to match your structure)
const PhoneInput = dynamic(
  () => import('react-phone-input-2').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <TextField fullWidth label="Phone Number" margin="normal" size="small" />
  }
);

// Country component with react-flags-select
const CountryInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const ReactFlagsSelect = dynamic(
    () => import('react-flags-select').then((mod) => mod.default),
    { ssr: false, loading: () => <TextField fullWidth label="Country" margin="normal" size="small" /> }
  );


  
  

  return (
    <Box sx={{ 
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
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }
      }
    }}>
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

// Address component
const AddressInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
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
};

// Main CertificationPage component
const CertificationPage = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    email: '',
    phoneNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postalCode: ''
  });

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const res = await fetch('/api/users/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  
    if (res.ok) {
      alert("Profile completed!");
      window.location.href = '/dashboards/dashboard'; 
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      
      <Paper elevation={3} sx={{ p: 3, backgroundColor:  '#fcfcf9'  }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Image
            src="/logoGEX.png"
            alt="Logo"
            width={60}
            height={60}
            style={{ borderRadius: '50%' }}
            />
        </Box>

  <Typography variant="subtitle1" align="center" sx={{ color: '#2b91d3', fontWeight: 600 }}>
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

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" color="primary" type="submit" size="small">
              Save
            </Button>
            <Button variant="contained" color="primary" size="small">
              Go to dashboard
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CertificationPage;