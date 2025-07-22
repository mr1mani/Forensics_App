import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

type ReportItem = {
  type: 'image' | 'audio';
  timestamp: number;
  result: {
    output: string;
    inputUri: string;
  };
};

interface ReportItemProps {
  item: ReportItem;
  onDelete: (timestamp: number) => void;
}

const ReportItemComponent = ({ item, onDelete }: ReportItemProps) => {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [fileInfo, setFileInfo] = useState({
    exists: false,
    size: 'Unknown',
    loading: false
  });

  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
    card: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
    text: colorScheme === 'dark' ? '#ffffff' : '#000000',
    border: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    primary: '#6200ee',
    danger: '#ff4444',
    success: '#4caf50'
  };

  const loadFileInfo = async () => {
    try {
      setFileInfo(prev => ({ ...prev, loading: true }));
      const info = await FileSystem.getInfoAsync(item.result.inputUri);
      const size = info.exists && info.size ? `${Math.round(info.size / 1024)}KB` : 'Unknown';
      setFileInfo({ exists: info.exists, size, loading: false });
    } catch (error) {
      console.error('Error getting file info:', error);
      setFileInfo({ exists: false, size: 'Unknown', loading: false });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(item.timestamp);
            setModalVisible(false);
          }
        }
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.item,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border
          }
        ]}
        onPress={() => {
          loadFileInfo();
          setModalVisible(true);
        }}
      >
        <View style={styles.itemHeader}>
          <MaterialIcons 
            name={item.type === 'image' ? 'image' : 'audiotrack'} 
            size={20} 
            color={colors.primary} 
          />
          <ThemedText style={[styles.itemTitle, { color: colors.text }]}>
            {item.type === 'image' ? 'Image Analysis' : 'Audio Analysis'}
          </ThemedText>
        </View>
        
        <ThemedText style={[styles.itemDate, { color: colors.text }]}>
          {new Date(item.timestamp).toLocaleDateString()} •{' '}
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
        
        <ThemedText 
          numberOfLines={2} 
          style={[styles.itemPreview, { color: colors.text }]}
        >
          {item.result.output.split('\n')[0]}
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {fileInfo.loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  {item.type === 'image' ? (
                    fileInfo.exists ? (
                      <Image
                        source={{ uri: item.result.inputUri }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.missingFileContainer}>
                        <MaterialIcons 
                          name="broken-image" 
                          size={60} 
                          color={colors.danger} 
                        />
                        <ThemedText style={[styles.missingFileText, { color: colors.text }]}>
                          Original file not found
                        </ThemedText>
                      </View>
                    )
                  ) : (
                    <View style={styles.audioIconContainer}>
                      <MaterialIcons
                        name="audiotrack"
                        size={80}
                        color={colors.primary}
                      />
                    </View>
                  )}

                  <View style={styles.metadataContainer}>
                    <View style={styles.metadataRow}>
                      <MaterialIcons name="insert-drive-file" size={18} color={colors.text} />
                      <ThemedText 
                        style={[styles.metadataText, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {item.result.inputUri.split('/').pop()}
                      </ThemedText>
                    </View>

                    <View style={styles.metadataRow}>
                      <MaterialIcons name="access-time" size={18} color={colors.text} />
                      <ThemedText style={[styles.metadataText, { color: colors.text }]}>
                        {new Date(item.timestamp).toLocaleString()}
                      </ThemedText>
                    </View>

                    <View style={styles.metadataRow}>
                      <MaterialIcons name="storage" size={18} color={colors.text} />
                      <ThemedText style={[styles.metadataText, { color: colors.text }]}>
                        Size: {fileInfo.size}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.resultsContainer}>
                    <ThemedText style={[styles.resultsTitle, { color: colors.primary }]}>
                      Analysis Results
                    </ThemedText>
                    <ScrollView 
                      style={styles.resultsScroll}
                      showsVerticalScrollIndicator={true}
                    >
                      <ThemedText style={[styles.resultsText, { color: colors.text }]}>
                        {item.result.output}
                      </ThemedText>
                    </ScrollView>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                onPress={handleDelete}
              >
                <ThemedText style={styles.modalButtonText}>Delete Report</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
    emptyText: colorScheme === 'dark' ? '#aaaaaa' : '#666666'
  };

  const loadReports = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('forensic-reports');
      setReports(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Failed to load reports', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleDelete = async (timestamp: number) => {
    try {
      const updatedReports = reports.filter(report => report.timestamp !== timestamp);
      await AsyncStorage.setItem('forensic-reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
    } catch (error) {
      console.error('Deletion error:', error);
      Alert.alert('Error', 'Failed to delete report');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (isFocused) {
      loadReports();
    }
  }, [isFocused, loadReports]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={60} color={colors.emptyText} />
          <ThemedText style={[styles.emptyText, { color: colors.emptyText }]}>
            No reports yet
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.emptyText }]}>
            Process images or audio to see results here
          </ThemedText>
        </View>
      ) : (
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
          ListHeaderComponent={
            <ThemedText style={[styles.listHeader, { color: colors.emptyText }]}>
              {reports.length} report{reports.length !== 1 ? 's' : ''}
            </ThemedText>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  listHeader: {
    marginBottom: 12,
    marginLeft: 4,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemDate: {
    opacity: 0.8,
    marginBottom: 8,
  },
  itemPreview: {
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  audioIconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  missingFileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  missingFileText: {
    marginTop: 10,
  },
  metadataContainer: {
    gap: 12,
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    flexShrink: 1,
  },
  resultsContainer: {
    marginTop: 10,
    flex: 1,
  },
  resultsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  resultsScroll: {
    minHeight: 50,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultsText: {
    lineHeight: 20,
    flexGrow : 1,
  },
  modalButtons: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});