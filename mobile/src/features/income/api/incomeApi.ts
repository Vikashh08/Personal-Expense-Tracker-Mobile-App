import api from '../../../lib/axios';

export const addIncomeApi = async (data: any) => {
  const response = await api.post('/income', data);
  return response.data;
};

export const getIncomesApi = async () => {
  const response = await api.get('/income');
  return response.data;
};

export const deleteIncomeApi = async (id: string) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};
