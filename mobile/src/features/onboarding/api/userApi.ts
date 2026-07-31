import api from '../../../lib/axios';

export const updateOnboardingApi = async (data: { currency?: string; country?: string; theme?: string; monthlyIncome?: number }) => {
  const response = await api.put('/users/onboarding', data);
  return response.data;
};
