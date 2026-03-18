
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth-api.ts';
import type { RegisterRequest, RegisterResponse, ApiError } from '../../../api/types/auth.types';
import { useToast } from '../../../hooks/useToast';

export const useRegister = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data: RegisterResponse) => {
      showToast(`Registration successful! Welcome ${data.fullName}. You can now log in.`, 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error: ApiError) => {
      let errorMessage = 'An error occurred during registration';
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid registration data';
          break;
        case 409:
          errorMessage = 'This email is already registered';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          if (error.error === 'NETWORK_ERROR') {
            errorMessage = 'Unable to connect to the server';
          }
      }
      showToast(errorMessage, 'error');
    },
  });
};
