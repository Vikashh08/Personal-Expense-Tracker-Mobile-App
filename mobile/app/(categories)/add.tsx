import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addCategoryApi } from '../../src/features/categories/api/categoryApi';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
const ICONS = ['🛒', '🍔', '🚗', '🏠', '🎬', '💊', '🎓', '✈️', '🐶', '🎁', '💰', '💼', '📈', '📱', '👕'];

export default function AddCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = (params.type as 'INCOME' | 'EXPENSE') || 'EXPENSE';
  
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  const mutation = useMutation({
    mutationFn: addCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add category');
    }
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      type,
      color: selectedColor,
      icon: selectedIcon,
    });
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 px-6 pt-6">
      
      {/* Type Selection */}
      <View className="flex-row mb-6 bg-white rounded-xl border border-slate-200 p-1">
        <TouchableOpacity
          onPress={() => setType('EXPENSE')}
          className={`flex-1 py-3 items-center rounded-lg ${type === 'EXPENSE' ? 'bg-slate-800' : 'bg-transparent'}`}
        >
          <Text className={`font-semibold ${type === 'EXPENSE' ? 'text-white' : 'text-slate-500'}`}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType('INCOME')}
          className={`flex-1 py-3 items-center rounded-lg ${type === 'INCOME' ? 'bg-slate-800' : 'bg-transparent'}`}
        >
          <Text className={`font-semibold ${type === 'INCOME' ? 'text-white' : 'text-slate-500'}`}>Income</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Category Name</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-lg"
          placeholder="e.g. Groceries, Salary"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Select Color</Text>
        <View className="flex-row flex-wrap">
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              className="w-10 h-10 rounded-full mr-3 mb-3 items-center justify-center border-2"
              style={{ 
                backgroundColor: color, 
                borderColor: selectedColor === color ? '#1e293b' : 'transparent',
              }}
            >
              {selectedColor === color && <Text className="text-white text-xs font-bold">✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-medium mb-2">Select Icon</Text>
        <View className="flex-row flex-wrap bg-white p-3 border border-slate-200 rounded-xl">
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              className={`w-12 h-12 items-center justify-center rounded-xl ${selectedIcon === icon ? 'bg-slate-100 border border-slate-300' : ''}`}
            >
              <Text className="text-2xl">{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="w-full bg-indigo-600 rounded-xl py-4 items-center shadow-lg shadow-indigo-300 mt-4 mb-10"
        onPress={handleSave}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Save Category</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
