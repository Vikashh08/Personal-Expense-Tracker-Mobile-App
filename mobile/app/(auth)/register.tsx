import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { registerApi } from '../../src/features/auth/api/authApi';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !firstName) {
      Alert.alert('Error', 'Please fill required fields (First Name, Email, Password)');
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi({ email, password, firstName, lastName });
      await login(
        { id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName },
        data.token
      );
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-slate-800">Create Account</Text>
          <Text className="text-slate-500 mt-2">Start managing your expenses today</Text>
        </View>

        <View className="space-y-4">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-slate-700 mb-1 font-medium">First Name</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-700 mb-1 font-medium">Last Name</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

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
              placeholder="Create a password (min 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-indigo-600 rounded-xl py-4 items-center mt-4 shadow-sm shadow-indigo-200"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-medium">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
