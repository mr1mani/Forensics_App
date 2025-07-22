import { useSettings } from '@/contexts/SettingsContext';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { 
  Alert, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Switch,
  TextInput,
  View,
  TouchableOpacity,
  Appearance,
  Text // Added missing import
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [manualIp, setManualIp] = useState(settings.serverUrl);
  const [isEditing, setIsEditing] = useState(false);
  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleSaveServerUrl = () => {
    if (!manualIp.startsWith('http://') && !manualIp.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    updateSettings({ serverUrl: manualIp });
    setIsEditing(false);
    Alert.alert('Success', 'Server URL saved successfully');
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            resetToDefaults();
            setManualIp('');
          }
        }
      ]
    );
  };

  const handleSystemThemeChange = async () => {
    try {
      if (Platform.OS === 'android') {
        try {
          await Linking.openURL('xiaomi.intent.action.SYSTEM_THEME_MODE');
        } catch {
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.DISPLAY_SETTINGS
          );
        }
      } else {
        Alert.alert('Info', 'Please change system theme in iOS settings');
      }
    } catch (error) {
      console.error('Error opening theme settings:', error);
      Alert.alert('Error', 'Could not open system theme settings');
    }
  };

  // Color scheme
  const colors = {
    background: isDarkMode ? '#121212' : '#f5f5f5',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    primary: '#6200ee',
    success: '#4caf50',
    danger: '#f44336',
    warning: '#ff9800',
    placeholder: isDarkMode ? '#aaaaaa' : '#888888'
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="palette" size={24} color={colors.primary} />
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </ThemedText>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <MaterialIcons name="brightness-4" size={20} color={colors.text} />
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </ThemedText>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleSystemThemeChange}
            thumbColor={isDarkMode ? colors.primary : '#f5f5f5'}
            trackColor={{ false: '#767577', true: `${colors.primary}80` }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <MaterialIcons name="format-size" size={20} color={colors.text} />
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              Font Size
            </ThemedText>
          </View>
          <View style={styles.optionsContainer}>
            {['Small', 'Medium', 'Large'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => updateSettings({ fontSize: opt.toLowerCase() as 'small' | 'medium' | 'large' })}
                style={[
                  styles.optionButton,
                  settings.fontSize === opt.toLowerCase() && {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: colors.primary
                  }
                ]}
              >
                <ThemedText 
                  style={[
                    styles.optionText, 
                    { 
                      color: settings.fontSize === opt.toLowerCase() ? colors.primary : colors.text,
                      fontSize: opt === 'Small' ? 14 : opt === 'Medium' ? 16 : 18
                    }
                  ]}
                >
                  {opt}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Server Configuration Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="dns" size={24} color={colors.primary} />
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Server Configuration
          </ThemedText>
        </View>

        {isEditing ? (
          <View>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text,
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
                  borderColor: colors.border
                }
              ]}
              placeholder="Enter ngrok URL (e.g., https://xxxx.ngrok-free.app)"
              placeholderTextColor={colors.placeholder}
              value={manualIp}
              onChangeText={setManualIp}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.success }]}
                onPress={handleSaveServerUrl}
              >
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.danger }]}
                onPress={() => {
                  setIsEditing(false);
                  setManualIp(settings.serverUrl);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <MaterialIcons name="link" size={20} color={colors.text} />
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  Current Server
                </ThemedText>
              </View>
              <ThemedText 
                style={[styles.serverUrlText, { color: colors.primary }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {settings.serverUrl || 'Not configured'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <ThemedText style={styles.buttonText}>
                {settings.serverUrl ? 'Change Server URL' : 'Set Server URL'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="build" size={24} color={colors.primary} />
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Actions
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.warning }]}
          onPress={handleResetDefaults}
        >
          <ThemedText style={styles.buttonText}>Reset to Default Settings</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
          onPress={() => Linking.openSettings()}
        >
          <ThemedText style={[styles.buttonText, { color: colors.primary }]}>
            Open App Permissions
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  settingItem: {
    paddingVertical: 12,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  settingLabel: {
  },
  serverUrlText: {
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});