import { Alert } from 'react-native';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export type NetworkDiagnosticsResult = {
  isConnected: boolean;
  ipAddress: string;
  serverReachable: boolean | null;
  interfaces: string[];
  error?: string;
};

export const networkDiagnostics = async (serverUrl?: string): Promise<NetworkDiagnosticsResult> => {
  try {
    // Default result structure
    const result: NetworkDiagnosticsResult = {
      isConnected: false,
      ipAddress: '',
      serverReachable: null,
      interfaces: [],
    };

    // Get network state
    const networkState = await Network.getNetworkStateAsync();
    result.isConnected = networkState.isConnected || false;
    
    // Get IP address
    result.ipAddress = await Network.getIpAddressAsync();
    
    // Platform-specific interface detection
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        // Type assertion for NetworkState
        const typedState = networkState as unknown as {
          type?: Network.NetworkStateType;
          details?: { ipAddress?: string };
        };
        
        if (typedState.details?.ipAddress) {
          result.interfaces = [typedState.details.ipAddress];
        }
      } catch (error) {
        console.warn('Network details unavailable:', error);
      }
    }
    
    // Add the primary IP if not already included
    if (result.ipAddress && !result.interfaces.includes(result.ipAddress)) {
      result.interfaces.push(result.ipAddress);
    }

    // Check server connection if URL is provided
    if (serverUrl) {
      try {
        const response = await fetchWithTimeout(`${serverUrl}/api/server-info`);
        result.serverReachable = response.ok;
      } catch {
        result.serverReachable = false;
      }
    }

    return result;
  } catch (error) {
    console.error('Network diagnostics failed:', error);
    return {
      isConnected: false,
      ipAddress: '',
      serverReachable: null,
      interfaces: [],
      error: 'Network diagnostics failed'
    };
  }
};

// Usage example in Settings screen
export const debugNetwork = async (serverUrl?: string) => {
  const diag = await networkDiagnostics(serverUrl);
  Alert.alert("Network Diagnostics", JSON.stringify(diag, null, 2));
};