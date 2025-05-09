import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

type ProcessingResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export default function AudioScreen() {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';
  const textColor = { color: isDarkMode ? 'white' : 'black' };

  const selectAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedAudio(result.assets[0].uri);
        setAudioResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const processAudio = async () => {
    if (!selectedAudio) return;
  
    setIsProcessing(true);
    setAudioResult(null);
  
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileInfo = await FileSystem.getInfoAsync(selectedAudio);
      
      // Add type check for file size
      if (!fileInfo.exists || fileInfo.size === undefined) {
        throw new Error('File not found or size unavailable');
      }
      
      const fileSize = (fileInfo.size / (1024 * 1024)).toFixed(2);
  
      const mockResult: ProcessingResult = {
        success: true,
        output: `Audio processed!\nSize: ${fileSize} MB\nPath: ${selectedAudio}\nMock analysis: 440Hz frequency`,
      };
  
      setAudioResult(mockResult);
    } catch (error) {
      setAudioResult({
        success: false,
        error: 'Processing failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, textColor]}>Audio Processing</Text>
      
      <TouchableOpacity style={styles.button} onPress={selectAudio}>
        <Text style={styles.buttonText}>Select Audio File</Text>
      </TouchableOpacity>

      {selectedAudio && (
        <View style={styles.previewContainer}>
          <Text style={[styles.audioFileName, textColor]}>
            {selectedAudio.split('/').pop()}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.processButton]}
            onPress={processAudio}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Process Audio</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {audioResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, textColor]}>
            {audioResult.success ? 'Results' : 'Error'}
          </Text>
          <Text style={[styles.resultText, { color: audioResult.success ? '#4CAF50' : '#F44336' }]}>
            {audioResult.success ? audioResult.output : audioResult.error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  processButton: {
    backgroundColor: '#03DAC6',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  audioFileName: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
});