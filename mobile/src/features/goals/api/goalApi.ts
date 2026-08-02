import api from '../../../lib/axios';

export const getGoalsApi = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const addGoalApi = async (data: any) => {
  const response = await api.post('/goals', data);
  return response.data;
};

export const addGoalContributionApi = async ({ id, amount }: { id: string; amount: number }) => {
  const response = await api.post(`/goals/${id}/contribute`, { amount });
  return response.data;
};

export const deleteGoalApi = async (id: string) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};
