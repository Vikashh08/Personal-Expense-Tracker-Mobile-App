import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        <View className="w-64 h-64 bg-indigo-100 rounded-full mb-10 items-center justify-center">
          {/* Placeholder for an awesome illustration */}
          <Text className="text-6xl">💸</Text>
        </View>

        <Text className="text-4xl font-extrabold text-slate-800 text-center mb-4">
          Master Your Money
        </Text>
        
        <Text className="text-lg text-slate-500 text-center mb-10">
          Track expenses, set budgets, and achieve your financial goals with ease.
        </Text>
      </View>

      <View className="px-8 pb-12">
        <TouchableOpacity
          className="w-full bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-300"
          onPress={() => router.push('/(onboarding)/preferences')}
        >
          <Text className="text-white font-bold text-xl">Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
