import React from 'react';
import { StyleSheet, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';

import ParallaxScrollView from '@/components/ParallaxScrollView';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <ImageBackground
        source={require('@/assets/images/forensic-bg.jpg')}
        style={styles.parallaxHeader}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        >
          <ThemedView style={styles.headerContent}>
            <ThemedText type="title" style={styles.appTitle}>Forensic Toolkit</ThemedText>
            <ThemedText style={styles.appDescription}>
              Professional-grade digital forensics in your pocket
            </ThemedText>
          </ThemedView>
        </LinearGradient>
      </ImageBackground>

      {/* Static Content Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>About This App</ThemedText>
        <ThemedText style={styles.guideText}>
          This forensic toolkit provides powerful analysis capabilities for both images and audio files. 
          Designed for security professionals and enthusiasts alike, it helps uncover hidden artifacts 
          and metadata that might be crucial for investigations.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>How To Use</ThemedText>
        <ThemedText style={styles.guideText}>
          1. <ThemedText type="defaultSemiBold">Image Analysis</ThemedText>: Upload an image to detect manipulation artifacts and extract metadata
        </ThemedText>
        <ThemedText style={styles.guideText}>
          2. <ThemedText type="defaultSemiBold">Audio Analysis</ThemedText>: Submit audio files to identify edits, anomalies, or hidden data
        </ThemedText>
        <ThemedText style={styles.guideText}>
          3. <ThemedText type="defaultSemiBold">Results</ThemedText>: View all previous analyses with detailed reports
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Key Features</ThemedText>
        <ThemedText style={styles.guideText}>
          • Comprehensive metadata extraction
        </ThemedText>
        <ThemedText style={styles.guideText}>
          • Tampering detection algorithms
        </ThemedText>
        <ThemedText style={styles.guideText}>
          • Secure local storage of results
        </ThemedText>
        <ThemedText style={styles.guideText}>
          • Dark/Light mode support
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  parallaxHeader: {
    height: 250,
    width: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    paddingBottom: 30,
  },
  appTitle: {
    fontSize: 28,
    marginBottom: 8,
    color: 'white', // Force white text
  },
  appDescription: {
    fontSize: 16,
    opacity: 0.9,
    color: 'white', // Force white text
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  guideText: {
    marginBottom: 10,
    lineHeight: 22,
  },
});