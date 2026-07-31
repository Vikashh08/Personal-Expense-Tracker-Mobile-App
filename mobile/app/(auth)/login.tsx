import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { loginApi } from '../../src/features/auth/api/authApi';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      await login(
        { id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName },
        data.token
      );
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-slate-50">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-slate-800">Welcome Back</Text>
        <Text className="text-slate-500 mt-2">Login to manage your expenses</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-700 mb-1 font-medium">Email Address</Text>
          <TextInput
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-slate-700 mb-1 font-medium">Password</Text>
          <TextInput
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-indigo-600 rounded-xl py-4 items-center mt-2 shadow-sm shadow-indigo-200"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-medium">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
