import { safeStorage } from '@/utils/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type Settings = {
  systemDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  serverUrl: string;
};

const FONT_SCALES = {
  small: 0.7,
  medium: 1,
  large: 1.4
};

const DEFAULT_SETTINGS: Settings = {
  systemDarkMode: Appearance.getColorScheme() === 'dark',
  fontSize: 'medium',
  serverUrl: 'deep-dogfish-pretty.ngrok-free.app',
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDefaults: () => Promise<void>;
  fontScale: number;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetToDefaults: async () => {},
  fontScale: 1
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1);

  // Load saved settings on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await safeStorage.getItem('app-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Merge with defaults to ensure all fields exist
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update font scale when fontSize changes
  useEffect(() => {
    setFontScale(FONT_SCALES[settings.fontSize]);
  }, [settings.fontSize]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await safeStorage.setItem('app-settings', JSON.stringify(updated));
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    await safeStorage.setItem('app-settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      resetToDefaults,
      fontScale
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);