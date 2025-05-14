import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

type ProcessingResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export default function ImageScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';
  const textColor = { color: isDarkMode ? 'white' : 'black' };

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos');
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
      setImageResult(null);
    }
  };

  const processImage = async () => {
  if (!selectedImage) return;
  
  setIsProcessing(true);
  setImageResult(null);

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: selectedImage,
      name: selectedImage.split('/').pop(),
      type: 'image/jpeg',
    } as any);

    const response = await fetch('http://192.168.100.208:5000/api/process', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    
    if (!response.ok) throw new Error(result.error || 'Processing failed');
    
    setImageResult(result);
  } catch (error) {
    setImageResult({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, textColor]}>Image Processing</Text>

      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={[styles.button, styles.processButton]}
            onPress={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Process Image</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {imageResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, textColor]}>
            {imageResult.success ? 'Results' : 'Error'}
          </Text>
          <Text
            style={[
              styles.resultText,
              { color: imageResult.success ? '#4CAF50' : '#F44336' }
            ]}
          >
            {imageResult.success ? imageResult.output : imageResult.error}
          </Text>
        </View>
      )}
    </ScrollView>
  );

}

const styles = StyleSheet.create({
  container: {
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
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
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