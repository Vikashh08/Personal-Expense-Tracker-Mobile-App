import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { exportTransactionsCSVApi } from '../src/features/reports/api/reportApi';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive', 
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        } 
      },
    ]);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Export current year for now
      const year = new Date().getFullYear();
      await exportTransactionsCSVApi(undefined, year);
      Alert.alert('Success', 'Transactions exported successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-6 border-b border-slate-200">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-4">
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-800">Profile & Settings</Text>
        </View>

        {/* User Card */}
        <View className="px-6 py-8 items-center">
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800">{user?.firstName} {user?.lastName}</Text>
          <Text className="text-slate-500 mt-1">{user?.email}</Text>
        </View>

        {/* Settings List */}
        <View className="px-4">
          <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-slate-100"
              onPress={() => Alert.alert('Coming Soon', 'Edit Profile module will be available soon.')}
            >
              <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-4">
                <Text className="text-indigo-500">✏️</Text>
              </View>
              <Text className="text-slate-700 font-medium flex-1 text-base">Edit Profile</Text>
              <Text className="text-slate-400">›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-slate-100"
              onPress={() => Alert.alert('Coming Soon', 'Currency selection will be available soon.')}
            >
              <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-4">
                <Text className="text-emerald-500">💵</Text>
              </View>
              <Text className="text-slate-700 font-medium flex-1 text-base">Currency</Text>
              <Text className="text-slate-400 font-medium">{user?.currency}</Text>
              <Text className="text-slate-400 ml-2">›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleExport}
              disabled={isExporting}
            >
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-4">
                {isExporting ? (
                   <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                   <Text className="text-blue-500">📄</Text>
                )}
              </View>
              <Text className="text-slate-700 font-medium flex-1 text-base">Export Transactions (CSV)</Text>
              <Text className="text-slate-400">›</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleLogout}
            >
              <View className="w-10 h-10 bg-rose-50 rounded-full items-center justify-center mr-4">
                <Text className="text-rose-500">🚪</Text>
              </View>
              <Text className="text-rose-600 font-bold flex-1 text-base">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
