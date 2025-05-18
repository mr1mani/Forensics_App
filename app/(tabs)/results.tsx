import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text, Modal, Image, useColorScheme, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

type ReportItem = {
  type: 'image' | 'audio';
  timestamp: number;
  result: {
    output: string;
    inputUri: string;
    size?: string;
  };
};

interface ReportItemProps {
  item: ReportItem;
  onDelete: (timestamp: number) => void;
}

const ReportItemComponent = ({ item, onDelete }: ReportItemProps) => {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    exists: boolean;
    size?: string;
  }>({ exists: false });

  const loadFileInfo = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      const size = info.exists && info.size ? `${Math.round(info.size / 1024)}KB` : 'Unknown';
      setFileInfo({ exists: info.exists, size });
    } catch (error) {
      console.error('Error getting file info:', error);
      setFileInfo({ exists: false });
    }
    setModalVisible(true);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          onDelete(item.timestamp);
          setModalVisible(false);
        }}
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }
        ]}
        onPress={() => loadFileInfo(item.result.inputUri)}
      >
        <ThemedText type="defaultSemiBold">{item.type} Analysis</ThemedText>
        <Text style={styles.date}>
          {new Date(item.timestamp).toLocaleDateString()} {' '}
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        <Text numberOfLines={2} style={styles.preview}>
          {item.result.output}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }
          ]}>
            {item.type === 'image' ? (
              fileInfo.exists ? (
                <Image
                  source={{ uri: item.result.inputUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.warningText}>Original file not found</Text>
              )
            ) : (
              <MaterialIcons
                name="audiotrack"
                size={80}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            )}

            <Text style={styles.modalText}>
              File: {item.result.inputUri.split('/').pop()}
            </Text>

            <Text style={styles.modalText}>
              Date: {new Date(item.timestamp).toLocaleDateString()}
            </Text>
            <Text style={styles.modalText}>
              Time: {new Date(item.timestamp).toLocaleTimeString()}
            </Text>

            <Text style={styles.modalText}>
              Size: {fileInfo.size || 'Unknown'}
            </Text>

            <Text style={styles.modalText}>
              Analysis Results:
            </Text>
            <Text style={styles.resultsText}>
              {item.result.output}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function ResultsScreen() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('forensic-reports');
      setReports(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Failed to load reports', error);
    }
  }, []);

  const handleDelete = async (timestamp: number) => {
    try {
      const updatedReports = reports.filter(report => report.timestamp !== timestamp);
      await AsyncStorage.setItem('forensic-reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
      Alert.alert('Success', 'Report deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete report');
      console.error('Deletion error:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports().finally(() => setRefreshing(false));
  }, [loadReports]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={({ item }) => (
          <ReportItemComponent 
            item={item} 
            onDelete={handleDelete} 
          />
        )}
        keyExtractor={(item) => item.timestamp.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  preview: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  modalText: {
    marginVertical: 4,
    fontSize: 16,
  },
  resultsText: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  closeButton: {
    backgroundColor: '#6200EE',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});