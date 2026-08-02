import api from '../../../lib/axios';

export const getExpenseByCategoryApi = async (month: number, year: number) => {
  const response = await api.get('/analytics/expense-by-category', { params: { month, year } });
  return response.data;
};

export const getCashFlowApi = async (year: number) => {
  const response = await api.get('/analytics/cash-flow', { params: { year } });
  return response.data;
};
