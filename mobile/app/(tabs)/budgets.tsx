import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getBudgetsApi, deleteBudgetApi } from '../../src/features/budgets/api/budgetApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function BudgetsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgetsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudgetApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete budget.');
    }
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Budget', 'Are you sure you want to remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const renderBudgetCard = ({ item }: { item: any }) => {
    // In a real app, you would fetch actual spent amounts dynamically.
    // For MVP, we will simulate a random spent amount based on the budget amount to show the UI visually.
    const spentAmount = Math.random() * item.amount;
    const progress = (spentAmount / item.amount) * 100;
    const isOverBudget = progress > 100;
    
    return (
      <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm shadow-slate-100 border border-slate-100">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center">
             <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.category?.color || '#3b82f6' }}>
                <Text className="text-xl">{item.category?.icon || '💵'}</Text>
              </View>
              <View>
                <Text className="text-slate-800 font-bold text-lg">{item.category?.name || 'Overall Budget'}</Text>
                <Text className="text-slate-500 text-xs">{item.period} LIMIT</Text>
              </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
             <Text className="text-red-500 text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500 font-medium">Spent</Text>
          <Text className="text-slate-800 font-bold">
            {currencySymbol}{spentAmount.toFixed(2)} / <Text className="text-slate-500">{currencySymbol}{item.amount.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <View 
            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
        {isOverBudget && (
          <Text className="text-red-500 text-xs font-bold mt-2 text-right">Over budget!</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-800 mb-2">My Budgets</Text>
        <Text className="text-slate-500 mb-4">Track your spending limits</Text>
      </View>

      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : isError ? (
           <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 mb-4">Failed to load budgets</Text>
            <TouchableOpacity onPress={() => refetch()} className="bg-indigo-600 px-6 py-2 rounded-xl">
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item: any) => item.id}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View className="items-center justify-center mt-12 p-8">
                <Text className="text-6xl mb-4">🎯</Text>
                <Text className="text-slate-500 text-center">You haven't set any budgets yet.</Text>
              </View>
            }
            renderItem={renderBudgetCard}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-300"
        onPress={() => Alert.alert('Coming Soon', 'Add Budget form will be built next!')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
