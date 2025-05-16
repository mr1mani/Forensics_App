import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';


export default function ResultsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem('forensic-reports');
      setReports(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Failed to load reports', error);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }
      ]}
    >
      <ThemedText type="defaultSemiBold">{item.type} Analysis</ThemedText>
      <ThemedText style={styles.date}>
        {new Date(item.timestamp).toLocaleString()}
      </ThemedText>
      <ThemedText numberOfLines={1} style={styles.preview}>
        {item.result.output}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.timestamp.toString()}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
    marginVertical: 3,
  },
  preview: {
    fontSize: 14,
    opacity: 0.9,
  },
});