import React, { createContext, useContext, useEffect, useState } from 'react';

import { safeStorage } from '@/utils/storage';

type Settings = {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium'
  });

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await safeStorage.getItem('app-settings');
      if (stored) setSettings(JSON.parse(stored));
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await safeStorage.setItem('app-settings', JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);





const loadSettings = async () => {
  try {
    const stored = await safeStorage.getItem('app-settings');
    if (stored) {
      const parsed: Settings = JSON.parse(stored);
      setSettings(parsed);
    }
  } catch (error) {
    console.error('Failed to load settings', error);
  }
};