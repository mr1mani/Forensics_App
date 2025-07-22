import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-image"
        options={{
          title: 'AI Detection',
          tabBarIcon: ({ color }) => <MaterialIcons name="image-search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forged-image"
        options={{
          title: 'Forgery Detection',
          tabBarIcon: ({ color }) => <MaterialIcons name="edit" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="audio"
        options={{
          title: 'Audio Analysis',
          tabBarIcon: ({ color }) => <MaterialIcons name="graphic-eq" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => <MaterialIcons name="folder" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}