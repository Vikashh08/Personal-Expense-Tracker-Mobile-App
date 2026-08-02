import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getGoalsApi, deleteGoalApi, addGoalContributionApi } from '../../src/features/goals/api/goalApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function SavingsGoalsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete goal.');
    }
  });

  const contributeMutation = useMutation({
    mutationFn: addGoalContributionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      Alert.alert('Success', 'Contribution added successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add contribution.');
    }
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Goal', 'Are you sure you want to remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const handleContribute = (id: string) => {
    // In a real app, this would open a modal to enter the amount.
    // For MVP, we simulate contributing a fixed amount to show progress updates.
    Alert.alert('Add Funds', 'How much would you like to contribute?', [
      { text: 'Cancel', style: 'cancel' },
      { text: '+ $100', onPress: () => contributeMutation.mutate({ id, amount: 100 }) },
      { text: '+ $500', onPress: () => contributeMutation.mutate({ id, amount: 500 }) },
    ]);
  };

  const renderGoalCard = ({ item }: { item: any }) => {
    const progress = (item.currentAmount / item.targetAmount) * 100;
    const isCompleted = item.isCompleted || progress >= 100;
    
    return (
      <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm shadow-slate-100 border border-slate-100">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center">
             <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color || '#10b981' }}>
                <Text className="text-xl">{item.icon || '🏆'}</Text>
              </View>
              <View>
                <Text className="text-slate-800 font-bold text-lg">{item.name}</Text>
                {isCompleted && <Text className="text-emerald-500 text-xs font-bold">ACHIEVED</Text>}
              </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
             <Text className="text-slate-400 text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500 font-medium">Saved</Text>
          <Text className="text-slate-800 font-bold">
            {currencySymbol}{item.currentAmount.toFixed(2)} / <Text className="text-slate-500">{currencySymbol}{item.targetAmount.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <View 
            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>

        {!isCompleted && (
          <TouchableOpacity 
            className="w-full bg-indigo-50 py-3 rounded-xl items-center"
            onPress={() => handleContribute(item.id)}
            disabled={contributeMutation.isPending}
          >
            <Text className="text-indigo-600 font-bold">Quick Add Funds</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-800 mb-2">Savings Goals</Text>
        <Text className="text-slate-500 mb-4">Build towards your future</Text>
      </View>

      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : isError ? (
           <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 mb-4">Failed to load goals</Text>
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
                <Text className="text-6xl mb-4">🏦</Text>
                <Text className="text-slate-500 text-center">You haven't set any savings goals yet.</Text>
              </View>
            }
            renderItem={renderGoalCard}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-300"
        onPress={() => Alert.alert('Coming Soon', 'Add Goal form will be built next!')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
