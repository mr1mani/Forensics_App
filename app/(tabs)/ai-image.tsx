import { useSettings } from '@/contexts/SettingsContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function ImageScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useSettings();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<ProcessingResult | null>(null);
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

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to select images',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => MediaLibrary.requestPermissionsAsync() }
        ]
      );
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: false
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        setImageResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error('Image selection error:', error);
    }
  };

  const processImage = async () => {
    if (!settings.serverUrl) {
      Alert.alert(
        'Server Not Configured',
        'Please set the server URL in settings first'
      );
      return;
    }

    if (!selectedImage) return;
    
    setIsProcessing(true);
    setIsUploading(true);
    setImageResult(null);

    try {
      // Ensure URL has proper protocol
      let serverUrl = settings.serverUrl;
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `https://${serverUrl}`;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: selectedImage.split('/').pop(),
        type: 'image/jpeg',
      } as any);

      // Add timeout to the fetch request
      const controller = new AbortController();

      const response = await fetch(`${serverUrl}/api/process/ai-image`, {
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
          type: 'image',
          timestamp: Date.now(),
          result: {
            output: result.output,
            inputUri: selectedImage,
          }
        };
        
        const existingReports = await AsyncStorage.getItem('forensic-reports');
        const reports = existingReports ? JSON.parse(existingReports) : [];
        reports.unshift(newReport);
        await AsyncStorage.setItem('forensic-reports', JSON.stringify(reports));
        
        Alert.alert('Analysis Complete', 'Image analysis saved to reports!');
      } catch (storageError) {
        console.error('Failed to save report:', storageError);
        Alert.alert('Warning', 'Analysis succeeded but report not saved');
      }

      setImageResult(result);

    } catch (error) {
      setIsUploading(false);
      setIsProcessing(false);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Processing Error', errorMessage, [
        { text: 'OK', style: 'cancel' },
        { text: 'Retry', onPress: processImage }
      ]);
      
      setImageResult({
        success: false,
        error: errorMessage
      });
      
      console.error('Image processing error:', error);
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
        <MaterialIcons name="image-search" size={28} color={colors.primary} />
        <ThemedText style={[styles.title, { color: colors.text }]}>
          AI-Generated Image Detection
        </ThemedText>
      </View>

      <ThemedText style={[styles.subtitle, { color: colors.placeholder }]}>
        Select an image to analyze for AI-generated content
      </ThemedText>

      <TouchableOpacity 
        style={[styles.selectButton, { backgroundColor: colors.primary }]}
        onPress={selectImage}
      >
        <MaterialIcons name="photo-library" size={20} color="white" />
        <ThemedText style={styles.buttonText}>Select Image</ThemedText>
      </TouchableOpacity>

      {selectedImage && (
        <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
          
          <TouchableOpacity
            style={[
              styles.processButton, 
              { 
                backgroundColor: colors.primary,
                opacity: isProcessing ? 0.7 : 1
              }
            ]}
            onPress={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.buttonContent}>
                {isUploading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <ThemedText style={styles.buttonText}>Analyzing...</ThemedText>
                  </>
                ) : (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <ThemedText style={styles.buttonText}>Analyzing...</ThemedText>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="search" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Analyze Image</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {imageResult && (
        <View style={[
          styles.resultCard, 
          { 
            backgroundColor: colors.card,
            borderLeftWidth: 4,
            borderLeftColor: imageResult.success ? colors.success : colors.danger
          }
        ]}>
          <ThemedText style={[
            styles.resultTitle, 
            { color: imageResult.success ? colors.success : colors.danger }
          ]}>
            {imageResult.success ? 'Analysis Results' : 'Analysis Failed'}
          </ThemedText>
          
          <ScrollView 
            style={styles.resultScroll}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={[styles.resultText, { color: colors.text }]}>
              {imageResult.success ? imageResult.output : imageResult.error}
            </ThemedText>
          </ScrollView>
        </View>
      )}

      {!selectedImage && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={20} color={colors.warning} />
          <ThemedText style={[styles.tipText, { color: colors.placeholder }]}>
            Tip: For best results, use high-quality images (min. 500x500 pixels)
          </ThemedText>
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
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
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