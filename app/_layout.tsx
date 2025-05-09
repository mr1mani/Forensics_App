import { Stack } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';

export default function RootLayout() {
  const state = useNavigationState(state => state);
  console.log('Current navigation state:', JSON.stringify(state, null, 2));

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}