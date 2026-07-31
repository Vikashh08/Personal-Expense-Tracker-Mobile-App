import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  isLoading: true,
  completeOnboarding: async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    set({ hasCompletedOnboarding: true });
  },
  checkOnboardingStatus: async () => {
    try {
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      set({ hasCompletedOnboarding: status === 'true', isLoading: false });
    } catch (e) {
      set({ isLoading: false, hasCompletedOnboarding: false });
    }
  },
}));
