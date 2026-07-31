import { Stack } from 'expo-router';

export default function IncomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Income History' }} />
      <Stack.Screen name="add" options={{ title: 'Add Income', presentation: 'modal' }} />
    </Stack>
  );
}
