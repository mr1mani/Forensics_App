import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  View, 
  useColorScheme
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const colors = {
    background: isDarkMode ? '#121212' : '#f5f5f5',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    primary: '#6200ee',
    secondary: '#03dac6',
    gradientStart: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)',
    gradientEnd: 'transparent'
  };

  const features = [
    {
      icon: 'image-search',
      title: 'Image Analysis',
      description: 'Detect AI-generated or manipulated images with advanced forensic analysis'
    },
    {
      icon: 'graphic-eq',
      title: 'Audio Analysis',
      description: 'Identify synthetic voices and audio tampering with spectral analysis'
    },
    {
      icon: 'storage',
      title: 'Secure Storage',
      description: 'All results stored locally on your device for privacy'
    },
    {
      icon: 'auto-awesome',
      title: 'Professional Grade',
      description: 'Uses the same techniques as forensic investigators'
    }
  ];

  const steps = [
    'Select an image or audio file from your device',
    'Process it through our forensic analysis engine',
    'View detailed results and save for future reference'
  ];

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Hero Section */}
      <ImageBackground
        source={require('@/assets/images/forensic-bg.jpg')}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        >
          <View style={styles.heroContent}>
            <ThemedText type="title" style={[styles.appTitle, { color: 'white' }]}>
              Forensic Toolkit
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.appDescription, { color: 'rgba(255,255,255,0.9)' }]}>
              Professional-grade digital forensics in your pocket
            </ThemedText>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* About Section */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          About This Tool
        </ThemedText>
        <ThemedText style={[styles.aboutText, { color: colors.text }]}>
          This forensic toolkit provides powerful analysis capabilities for both images and audio files. 
          Designed for security professionals and enthusiasts alike, it helps uncover hidden artifacts 
          and metadata that might be crucial for investigations.
        </ThemedText>
        <ThemedText style={[styles.aboutText, { color: colors.text }]}>
          All processing happens on your device or your own server - no data is sent to third parties 
          without your explicit permission.
        </ThemedText>
      </ThemedView>

      {/* Features Section */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Key Features
        </ThemedText>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={[
                styles.featureCard, 
                { 
                  backgroundColor: colors.card,
                  shadowColor: isDarkMode ? '#000' : '#aaa'
                }
              ]}
            >
              <MaterialIcons 
                name={feature.icon as any} 
                size={28} 
                color={colors.primary} 
                style={styles.featureIcon}
              />
              <ThemedText type="subtitle" style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </ThemedText>
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                {feature.description}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* How To Use Section */}
      <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          How To Use
        </ThemedText>
        
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <ThemedText type="defaultSemiBold" style={styles.stepNumberText}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={[styles.stepText, { color: colors.text }]}>
                {step}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  heroImage: {
    height: 300,
    width: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  heroContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  appTitle: {
    marginBottom: 8,
  },
  appDescription: {
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  sectionTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    marginBottom: 8,
  },
  featureText: {
    lineHeight: 20,
    opacity: 0.9,
  },
  stepsContainer: {
    gap: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
  },
  stepText: {
    flex: 1,
    lineHeight: 24,
  },
  aboutText: {
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
});