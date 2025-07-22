import { useSettings } from '@/contexts/SettingsContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';

type ProcessingResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export default function AudioScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useSettings();
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
    card: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
    text: colorScheme === 'dark' ? '#ffffff' : '#000000',
    border: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    primary: '#6200ee',
    success: '#4caf50',
    danger: '#f44336',
    warning: '#ff9800',
    placeholder: colorScheme === 'dark' ? '#aaaaaa' : '#888888'
  };

  const selectAudio = async () => {
    try {
      // Allow picking any file type
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',  // This allows all file types
        copyToCacheDirectory: true,
        multiple: false
      });

      // If user canceled or no file selected
      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      // Get file extension
      const fileName = result.assets[0].name || '';
      const fileExt = fileName.split('.').pop()?.toLowerCase();

      // Check if extension is supported
      if (fileExt && ['mp3', 'wav', 'flac'].includes(fileExt)) {
        // Valid audio file
        setSelectedAudio(result.assets[0].uri);
        setAudioResult(null);
      } else {
        // Invalid file type
        Alert.alert(
          'Invalid File Type',
          'Please select an MP3, WAV, or FLAC audio file',
          [{ text: 'OK', style: 'cancel' }]
        );
        console.log('Invalid file selected:', fileName);
      }
    } catch (error) {
      Alert.alert(
        'Selection Error',
        'Failed to select audio file. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
      console.error('Audio selection error:', error);
    }
  };

  const processAudio = async () => {
    if (!settings.serverUrl) {
      Alert.alert(
        'Server Not Configured',
        'Please set the server URL in settings first'
      );
      return;
    }

    if (!selectedAudio) return;
    
    setIsProcessing(true);
    setIsUploading(true);
    setAudioResult(null);

    try {
      // Ensure URL has proper protocol
      let serverUrl = settings.serverUrl;
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `https://${serverUrl}`;
      }

      const formData = new FormData();
      const fileExt = selectedAudio.split('.').pop()?.toLowerCase();
      let mimeType = 'audio/mpeg'; // default to MP3

      if (fileExt === 'wav') {
        mimeType = 'audio/wav';
      } else if (fileExt === 'flac') {
        mimeType = 'audio/flac';
      }

      formData.append('file', {
        uri: selectedAudio,
        name: selectedAudio.split('/').pop(),
        type: mimeType, // Use the determined MIME type
      } as any);

      // Add timeout to the fetch request
      const controller = new AbortController();

      const response = await fetch(`${serverUrl}/api/process/audio`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
        signal: controller.signal
      });
      
      setIsUploading(false);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }
      
      try {
        const newReport = {
          type: 'audio',
          timestamp: Date.now(),
          result: {
            output: result.output,
            inputUri: selectedAudio,
          }
        };
        
        const existingReports = await AsyncStorage.getItem('forensic-reports');
        const reports = existingReports ? JSON.parse(existingReports) : [];
        reports.unshift(newReport);
        await AsyncStorage.setItem('forensic-reports', JSON.stringify(reports));
        
        Alert.alert('Analysis Complete', 'Audio analysis saved to reports!');
      } catch (storageError) {
        console.error('Failed to save report:', storageError);
        Alert.alert('Warning', 'Analysis succeeded but report not saved');
      }

      setAudioResult(result);

    } catch (error) {
      setIsUploading(false);
      setIsProcessing(false);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Audio processing may take longer.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Processing Error', errorMessage, [
        { text: 'OK', style: 'cancel' },
        { text: 'Retry', onPress: processAudio }
      ]);
      
      setAudioResult({
        success: false,
        error: errorMessage
      });
      
      console.error('Audio processing error:', error);
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <MaterialIcons name="graphic-eq" size={28} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Synthetic Voice Detection
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.placeholder }]}>
        Select an audio file to analyze for synthetic or manipulated content
      </Text>

      <TouchableOpacity 
        style={[styles.selectButton, { backgroundColor: colors.primary }]}
        onPress={selectAudio}
      >
        <MaterialIcons name="library-music" size={20} color="white" />
        <Text style={styles.buttonText}>Select Audio File</Text>
      </TouchableOpacity>

      {selectedAudio && (
        <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
          <View style={styles.audioInfo}>
            <MaterialIcons 
              name="audiotrack" 
              size={24} 
              color={colors.primary} 
            />
            <Text 
              style={[styles.audioFileName, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {selectedAudio.split('/').pop()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.processButton, 
              { 
                backgroundColor: colors.primary,
                opacity: isProcessing ? 0.7 : 1
              }
            ]}
            onPress={processAudio}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.buttonContent}>
                {isUploading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.buttonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.buttonText}>Analyzing...</Text>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="search" size={20} color="white" />
                <Text style={styles.buttonText}>Analyze Audio</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {audioResult && (
        <View style={[
          styles.resultCard, 
          { 
            backgroundColor: colors.card,
            borderLeftWidth: 4,
            borderLeftColor: audioResult.success ? colors.success : colors.danger
          }
        ]}>
          <Text style={[
            styles.resultTitle, 
            { color: audioResult.success ? colors.success : colors.danger }
          ]}>
            {audioResult.success ? 'Analysis Results' : 'Analysis Failed'}
          </Text>
          
          <ScrollView 
            style={styles.resultScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.resultText, { color: colors.text }]}>
              {audioResult.success ? audioResult.output : audioResult.error}
            </Text>
          </ScrollView>
        </View>
      )}

      {!selectedAudio && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={20} color={colors.warning} />
          <Text style={[styles.tipText, { color: colors.placeholder }]}>
            Tip: For best results, use clear audio recordings (min. 10 seconds)
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  audioFileName: {
    fontSize: 16,
    flex: 1,
  },
  processButton: {
    borderRadius: 8,
    padding: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  resultCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 200,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  tipText: {
    fontSize: 13,
    flex: 1,
  },
});