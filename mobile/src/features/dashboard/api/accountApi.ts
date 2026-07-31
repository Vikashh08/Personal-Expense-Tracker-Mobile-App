import api from '../../../lib/axios';

export const getAccountsApi = async () => {
  const response = await api.get('/accounts');
  return response.data;
};
