import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarStyle: { backgroundColor: '#fff' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="image"
        options={{
          title: 'Image',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="image" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="audiotrack" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}