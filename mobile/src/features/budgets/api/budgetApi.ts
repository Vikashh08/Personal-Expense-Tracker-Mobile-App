import api from '../../../lib/axios';

export const getBudgetsApi = async () => {
  const response = await api.get('/budgets');
  return response.data;
};

export const addBudgetApi = async (data: any) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const deleteBudgetApi = async (id: string) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};
