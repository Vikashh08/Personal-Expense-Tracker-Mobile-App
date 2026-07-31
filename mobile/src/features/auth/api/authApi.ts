import api from '../../../lib/axios';

export const loginApi = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
