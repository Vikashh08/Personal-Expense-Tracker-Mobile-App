import api from '../../../lib/axios';

interface TransactionQueryParams {
  search?: string;
  type?: 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
}

export const getTransactionsApi = async (params?: TransactionQueryParams) => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.type) query.append('type', params.type);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);

  const response = await api.get(`/transactions?${query.toString()}`);
  return response.data;
};
