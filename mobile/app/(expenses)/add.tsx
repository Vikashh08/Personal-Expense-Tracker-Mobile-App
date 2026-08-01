import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { addExpenseApi } from '../../src/features/expenses/api/expenseApi';
import { getAccountsApi } from '../../src/features/dashboard/api/accountApi';

export default function AddExpenseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccountsApi,
  });

  const mutation = useMutation({
    mutationFn: addExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add expense');
    }
  });

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const accountId = selectedAccountId || (accounts && accounts.length > 0 ? accounts[0].id : null);
    if (!accountId) {
      Alert.alert('Error', 'No account found. Please create an account first.');
      return;
    }

    mutation.mutate({
      amount: parseFloat(amount),
      accountId,
      merchant,
      notes,
    });
  };

  if (accountsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 px-6 pt-6">
      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Amount</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-rose-600"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Merchant</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          placeholder="e.g. Starbucks, Amazon, Target"
          value={merchant}
          onChangeText={setMerchant}
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Account to charge</Text>
        <View className="flex-row flex-wrap">
          {accounts?.map((acc: any) => (
            <TouchableOpacity
              key={acc.id}
              onPress={() => setSelectedAccountId(acc.id)}
              className={`mr-2 mb-2 px-4 py-2 rounded-xl border ${selectedAccountId === acc.id || (!selectedAccountId && accounts[0].id === acc.id) ? 'bg-rose-100 border-rose-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={selectedAccountId === acc.id || (!selectedAccountId && accounts[0].id === acc.id) ? 'text-rose-600 font-bold' : 'text-slate-600'}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Notes</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        className="w-full bg-rose-600 rounded-xl py-4 items-center shadow-lg shadow-rose-300 mt-4"
        onPress={handleSave}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Save Expense</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
