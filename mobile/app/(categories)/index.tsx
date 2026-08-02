import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getCategoriesApi, deleteCategoryApi } from '../../src/features/categories/api/categoryApi';

export default function CategoriesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories', filterType],
    queryFn: () => getCategoriesApi(filterType),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete category.');
    }
  });

  const handleDelete = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Not allowed', 'System default categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete Category', 'Are you sure? Transactions using this category will lose their categorization.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-red-500 mb-4">Failed to load categories</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-indigo-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Type Toggle */}
      <View className="flex-row p-4 bg-white border-b border-slate-200">
        <TouchableOpacity
          onPress={() => setFilterType('EXPENSE')}
          className={`flex-1 py-2 items-center rounded-lg mr-2 ${filterType === 'EXPENSE' ? 'bg-slate-800' : 'bg-slate-100'}`}
        >
          <Text className={`font-semibold ${filterType === 'EXPENSE' ? 'text-white' : 'text-slate-500'}`}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterType('INCOME')}
          className={`flex-1 py-2 items-center rounded-lg ml-2 ${filterType === 'INCOME' ? 'bg-slate-800' : 'bg-slate-100'}`}
        >
          <Text className={`font-semibold ${filterType === 'INCOME' ? 'text-white' : 'text-slate-500'}`}>Income</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View className="items-center justify-center mt-12 p-8">
            <Text className="text-6xl mb-4">📂</Text>
            <Text className="text-slate-500 text-center">No categories found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: item.color || '#f1f5f9' }}>
                <Text className="text-xl">{item.icon || (item.type === 'INCOME' ? '💰' : '🛒')}</Text>
              </View>
              <View>
                <Text className="text-slate-800 font-semibold text-lg">{item.name}</Text>
                {item.isDefault && <Text className="text-slate-400 text-xs mt-1">System Default</Text>}
              </View>
            </View>
            {!item.isDefault && (
              <TouchableOpacity onPress={() => handleDelete(item.id, item.isDefault)} className="p-2">
                <Text className="text-red-500 font-medium">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-300"
        onPress={() => router.push({ pathname: '/(categories)/add', params: { type: filterType } })}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
