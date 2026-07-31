import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../src/features/onboarding/store/onboardingStore';
import { updateOnboardingApi } from '../../src/features/onboarding/api/userApi';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function PreferencesScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();
  const { user } = useAuthStore();
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [theme, setTheme] = useState('system');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateOnboardingApi({
        currency,
        country,
        theme,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
      });
      await completeOnboarding();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 32, flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-slate-800 mb-2">Personalize App</Text>
        <Text className="text-slate-500 mb-8">Let's set up your basic preferences.</Text>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-700 font-medium mb-2">Preferred Currency</Text>
            <View className="flex-row space-x-2">
              {['USD', 'EUR', 'GBP', 'INR'].map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => setCurrency(cur)}
                  className={`px-4 py-2 rounded-xl border ${currency === cur ? 'bg-indigo-100 border-indigo-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={currency === cur ? 'text-indigo-600 font-bold' : 'text-slate-600'}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-slate-700 font-medium mb-2">Country Code</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="e.g., US, UK, IN"
            />
          </View>

          <View>
            <Text className="text-slate-700 font-medium mb-2">Monthly Income (Optional)</Text>
            <TextInput
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="0.00"
            />
          </View>
        </View>

        <View className="flex-1 justify-end mt-12">
          <TouchableOpacity
            className="w-full bg-indigo-600 rounded-xl py-4 items-center shadow-md shadow-indigo-200"
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
