import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveReport = async (report: any) => {
  try {
    const existing = await AsyncStorage.getItem('forensic-reports');
    const reports = existing ? JSON.parse(existing) : [];
    reports.unshift(report);
    await AsyncStorage.setItem('forensic-reports', JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error('Report save failed:', error);
    return false;
  }
};