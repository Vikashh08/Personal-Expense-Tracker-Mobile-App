import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { getTransactionsApi } from '../../src/features/transactions/api/transactionApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', search, filterType],
    queryFn: () => getTransactionsApi({
      search: search || undefined,
      type: filterType === 'ALL' ? undefined : filterType,
    }),
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-800 mb-4">Transactions</Text>
        
        {/* Search Bar */}
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-4"
          placeholder="Search by notes or merchant..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />

        {/* Filter Chips */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            onPress={() => setFilterType('ALL')}
            className={`mr-2 px-4 py-2 rounded-full border ${filterType === 'ALL' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
          >
            <Text className={filterType === 'ALL' ? 'text-white font-medium' : 'text-slate-600'}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilterType('INCOME')}
            className={`mr-2 px-4 py-2 rounded-full border ${filterType === 'INCOME' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
          >
            <Text className={filterType === 'INCOME' ? 'text-white font-medium' : 'text-slate-600'}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilterType('EXPENSE')}
            className={`mr-2 px-4 py-2 rounded-full border ${filterType === 'EXPENSE' ? 'bg-rose-600 border-rose-600' : 'bg-white border-slate-200'}`}
          >
            <Text className={filterType === 'EXPENSE' ? 'text-white font-medium' : 'text-slate-600'}>Expenses</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : isError ? (
           <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 mb-4">Failed to load transactions</Text>
            <TouchableOpacity onPress={() => refetch()} className="bg-indigo-600 px-6 py-2 rounded-xl">
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlashList
            data={data}
            keyExtractor={(item: any) => item.id}
            estimatedItemSize={75}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View className="items-center justify-center mt-12 p-8">
                <Text className="text-6xl mb-4">📭</Text>
                <Text className="text-slate-500 text-center">No transactions match your search.</Text>
              </View>
            }
            renderItem={({ item }: { item: any }) => (
              <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center mx-2">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.type === 'INCOME' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <Text>{item.type === 'INCOME' ? '💰' : '🛒'}</Text>
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-slate-800 font-semibold text-base" numberOfLines={1}>
                      {item.merchant || item.category?.name || (item.type === 'INCOME' ? 'Income' : 'Expense')}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                    {item.notes && <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>{item.notes}</Text>}
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-base ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'INCOME' ? '+' : '-'}{currencySymbol}{item.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
