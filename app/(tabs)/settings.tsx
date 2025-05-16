import { useSettings } from '@/contexts/SettingsContext';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import * as Linking from 'expo-linking';
import { ScrollView, StyleSheet, Switch } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const colorScheme = useSettings().settings.theme;

  return (
    <ScrollView style={{ 
      flex: 1, 
      backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
      padding: 20
    }}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Appearance</ThemedText>
        
        <SettingItem
          label="Dark Mode"
          rightComponent={
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={(val) => 
                updateSettings({ theme: val ? 'dark' : 'light' })
              }
            />
          }
        />

        <SettingItem
          label="Font Size"
          options={['Small', 'Medium', 'Large']}
          selected={settings.fontSize}

          // fontSize in SettingsContext.tsx is: 'small' | 'medium' | 'large'
          onSelect={(size: 'small' | 'medium' | 'large') => updateSettings({ fontSize: size })}

        />
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

function SettingItem({ label, options, selected, onSelect, rightComponent }: any) {
  return (
    <ThemedView style={styles.settingItem}>
      <ThemedText>{label}</ThemedText>
      
      {options ? (
        <ThemedView style={styles.options}>
          {options.map((opt: string) => (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt.toLowerCase())}
              style={[
                styles.option,
                selected === opt.toLowerCase() && styles.selectedOption
              ]}
            >
              <ThemedText>{opt}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      ) : rightComponent}
    </ThemedView>
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