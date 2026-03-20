import * as Yup from 'yup';

export const generalValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),

  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .required('Full name is required'),
});

export const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Current password is required'),

  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
});
