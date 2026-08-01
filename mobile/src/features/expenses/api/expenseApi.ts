import api from '../../../lib/axios';

export const addExpenseApi = async (data: any) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const getExpensesApi = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const deleteExpenseApi = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
