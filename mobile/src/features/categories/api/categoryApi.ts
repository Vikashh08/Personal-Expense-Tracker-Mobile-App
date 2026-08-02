import api from '../../../lib/axios';

export const getCategoriesApi = async (type?: 'INCOME' | 'EXPENSE' | 'TRANSFER') => {
  const query = type ? `?type=${type}` : '';
  const response = await api.get(`/categories${query}`);
  return response.data;
};

export const addCategoryApi = async (data: any) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategoryApi = async (data: { id: string, payload: any }) => {
  const response = await api.put(`/categories/${data.id}`, data.payload);
  return response.data;
};

export const deleteCategoryApi = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
