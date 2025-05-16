import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback in-memory storage if AsyncStorage fails
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage failed, using memory fallback', error);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage failed, using memory fallback', error);
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage failed, using memory fallback', error);
      delete memoryStorage[key];
    }
  },
};