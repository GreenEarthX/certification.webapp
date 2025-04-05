import { useState } from 'react';
import { submitUserProfile } from '@/services/users/fetchUserAPI';



export const useUserForm = () => {
  const [formData, setFormData] = useState({
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const success = await submitUserProfile(formData);
      if (success) {
        alert('Profile completed!');
        window.location.href = '/dashboards/dashboard';
      } else {
        alert('Something went wrong.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred.');
    }
  };

  return {
    formData,
    handleChange,
    handleInputChange,
    handleSubmit,
  };
};
