import { useSettings } from '@/contexts/SettingsContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  const handleSystemThemeChange = async () => {
    try {
      if (Platform.OS === 'android') {
        try {
          // Try Xiaomi-specific theme settings
          await Linking.openURL('xiaomi.intent.action.SYSTEM_THEME_MODE');
        } catch (error) {
          // Fallback to general Android display settings
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

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">System Theme</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedText>Dark Mode</ThemedText>
          <Switch
            value={settings.systemDarkMode}
            onValueChange={handleSystemThemeChange}
          />
        </ThemedView>

        <ThemedView style={styles.settingItem}>
          <ThemedText>Font Size</ThemedText>
          <ThemedView style={styles.options}>
            {['Small', 'Medium', 'Large'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => updateSettings({ fontSize: opt.toLowerCase() as 'small' | 'medium' | 'large' })}
                style={[
                  styles.option,
                  settings.fontSize === opt.toLowerCase() && styles.selectedOption
                ]}
              >
                <ThemedText>{opt}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Permissions</ThemedText>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          style={styles.permissionButton}
        >
          <ThemedText type="link">Open App Settings</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    padding: 8,
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#6200EE33',
  },
  permissionButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
});