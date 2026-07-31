import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../../src/features/dashboard/api/dashboardApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-red-500 mb-4">Failed to load dashboard data</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-indigo-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="flex-row justify-between items-center mb-8 mt-4">
          <View>
            <Text className="text-slate-500 text-sm">Good Morning,</Text>
            <Text className="text-2xl font-bold text-slate-800">{user?.firstName || 'User'}</Text>
          </View>
          <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
            <Text className="text-xl">👤</Text>
          </View>
        </View>

        {/* Main Balance Card */}
        <View className="bg-indigo-600 rounded-3xl p-6 mb-6 shadow-lg shadow-indigo-300">
          <Text className="text-indigo-200 text-sm font-medium mb-1">Total Balance</Text>
          <Text className="text-white text-4xl font-extrabold mb-6">
            {currencySymbol}{data.currentBalance.toFixed(2)}
          </Text>
          <View className="flex-row justify-between pt-4 border-t border-indigo-500/50">
            <View>
              <Text className="text-indigo-200 text-xs mb-1">Income</Text>
              <Text className="text-white font-bold">{currencySymbol}{data.monthlyIncome.toFixed(2)}</Text>
            </View>
            <View>
              <Text className="text-indigo-200 text-xs mb-1">Expenses</Text>
              <Text className="text-white font-bold">{currencySymbol}{data.monthlyExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity className="flex-1 bg-white items-center p-4 rounded-2xl mr-2 shadow-sm shadow-slate-200">
            <Text className="text-2xl mb-2">⬇️</Text>
            <Text className="text-slate-700 font-medium text-xs">Income</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white items-center p-4 rounded-2xl mx-1 shadow-sm shadow-slate-200">
            <Text className="text-2xl mb-2">⬆️</Text>
            <Text className="text-slate-700 font-medium text-xs">Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white items-center p-4 rounded-2xl ml-2 shadow-sm shadow-slate-200">
            <Text className="text-2xl mb-2">🔄</Text>
            <Text className="text-slate-700 font-medium text-xs">Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Recent Transactions</Text>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          
          {data.recentTransactions.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl items-center shadow-sm shadow-slate-200">
              <Text className="text-slate-400">No recent transactions.</Text>
            </View>
          ) : (
            data.recentTransactions.map((tx: any) => (
              <View key={tx.id} className="flex-row justify-between items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-4">
                    <Text>{tx.type === 'INCOME' ? '💼' : '🛒'}</Text>
                  </View>
                  <View>
                    <Text className="text-slate-800 font-semibold text-base">{tx.category?.name || 'Uncategorized'}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{new Date(tx.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text className={`font-bold text-base ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
