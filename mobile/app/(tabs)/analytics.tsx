import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getExpenseByCategoryApi, getCashFlowApi } from '../../src/features/analytics/api/analyticsApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['analytics', 'category', selectedMonth, selectedYear],
    queryFn: () => getExpenseByCategoryApi(selectedMonth, selectedYear),
  });

  const { data: cashFlowData, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['analytics', 'cashFlow', selectedYear],
    queryFn: () => getCashFlowApi(selectedYear),
  });

  // Render Cash Flow Bar Chart using custom flexbox
  const renderCashFlowChart = () => {
    if (cashFlowLoading || !cashFlowData) {
      return <ActivityIndicator size="small" color="#4f46e5" className="my-8" />;
    }

    const maxAmount = Math.max(
      ...cashFlowData.map((d: any) => Math.max(d.income, d.expense)),
      1 // prevent divide by zero
    );

    return (
      <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm shadow-slate-200 border border-slate-100">
        <Text className="text-lg font-bold text-slate-800 mb-6">Cash Flow ({selectedYear})</Text>
        
        <View className="flex-row justify-between h-48 items-end mb-4">
          {cashFlowData.map((data: any, index: number) => {
            const incomeHeight = (data.income / maxAmount) * 100;
            const expenseHeight = (data.expense / maxAmount) * 100;
            
            return (
              <View key={index} className="items-center flex-1">
                <View className="flex-row items-end justify-center w-full h-full pb-2">
                  {/* Income Bar */}
                  <View 
                    className="w-2 bg-emerald-400 rounded-t-full mx-[1px]" 
                    style={{ height: `${incomeHeight}%`, minHeight: data.income > 0 ? 4 : 0 }} 
                  />
                  {/* Expense Bar */}
                  <View 
                    className="w-2 bg-rose-400 rounded-t-full mx-[1px]" 
                    style={{ height: `${expenseHeight}%`, minHeight: data.expense > 0 ? 4 : 0 }} 
                  />
                </View>
                <Text className="text-[10px] text-slate-400 font-medium">{MONTHS[index]}</Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row justify-center mt-2 space-x-6">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-emerald-400 rounded-full mr-2" />
            <Text className="text-slate-600 font-medium text-xs">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-rose-400 rounded-full mr-2" />
            <Text className="text-slate-600 font-medium text-xs">Expense</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Expense By Category List
  const renderCategoryBreakdown = () => {
    if (categoryLoading || !categoryData) {
      return <ActivityIndicator size="small" color="#4f46e5" className="my-8" />;
    }

    if (categoryData.length === 0) {
      return (
        <View className="bg-white p-8 rounded-3xl items-center border border-slate-100 shadow-sm shadow-slate-200">
           <Text className="text-4xl mb-3">📊</Text>
           <Text className="text-slate-500 font-medium text-center">No expenses recorded for this month.</Text>
        </View>
      );
    }

    const totalExpense = categoryData.reduce((acc: number, curr: any) => acc + curr.total, 0);

    // Sort by largest expense
    const sortedData = [...categoryData].sort((a, b) => b.total - a.total);

    return (
      <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm shadow-slate-200 border border-slate-100">
        <View className="flex-row justify-between items-center mb-6">
           <Text className="text-lg font-bold text-slate-800">Top Expenses</Text>
           <Text className="text-slate-500 font-medium">{MONTHS[selectedMonth - 1]} {selectedYear}</Text>
        </View>
        
        {sortedData.map((item: any, index: number) => {
          const percentage = ((item.total / totalExpense) * 100).toFixed(1);
          return (
            <View key={index} className="mb-4">
              <View className="flex-row justify-between mb-2 items-center">
                <View className="flex-row items-center">
                   <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                   <Text className="text-slate-700 font-medium">{item.categoryName}</Text>
                </View>
                <View className="items-end">
                   <Text className="text-slate-800 font-bold">{currencySymbol}{item.total.toFixed(2)}</Text>
                   <Text className="text-slate-400 text-xs">{percentage}%</Text>
                </View>
              </View>
              <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full" 
                  style={{ width: `${percentage}%`, backgroundColor: item.color }} 
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-800">Analytics</Text>
          <Text className="text-slate-500">Understand your money</Text>
        </View>

        {renderCashFlowChart()}
        {renderCategoryBreakdown()}
        
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
