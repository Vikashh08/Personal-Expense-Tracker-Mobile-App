import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getExpensesApi, deleteExpenseApi } from '../../src/features/expenses/api/expenseApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function ExpensesHistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpensesApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete expense.');
    }
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this transaction?', [
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
        <Text className="text-red-500 mb-4">Failed to load expense history</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-indigo-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View className="items-center justify-center mt-12 p-8">
            <Text className="text-6xl mb-4">🤷‍♂️</Text>
            <Text className="text-slate-500 text-center">No expense transactions found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-rose-100 rounded-full items-center justify-center mr-4">
                <Text>🛒</Text>
              </View>
              <View className="flex-1 pr-4">
                <Text className="text-slate-800 font-semibold text-lg" numberOfLines={1}>
                  {item.merchant || item.category?.name || 'Expense'}
                </Text>
                <Text className="text-slate-400 text-xs mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                {item.notes && <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>{item.notes}</Text>}
              </View>
            </View>
            <View className="items-end">
              <Text className="font-bold text-lg text-rose-600">
                -{currencySymbol}{item.amount.toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)} className="mt-2">
                <Text className="text-red-500 text-sm font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-300"
        onPress={() => router.push('/(expenses)/add')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
