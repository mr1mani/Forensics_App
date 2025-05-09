import { View, Text } from 'react-native';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', 
      backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }}>
      <Text style={{ color: colorScheme === 'dark' ? 'white' : 'black' }}>
        Welcome to Forensics App
      </Text>
    </View>
  );
}