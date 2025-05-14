import { Stack } from 'expo-router';
import SplashScreen from './splash';
import { useState, useEffect } from 'react';

export default function RootLayout() {

  // const state = useNavigationState(state => state);
  // console.log('Current navigation state:', JSON.stringify(state, null, 2));

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 3000);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}


// Testing code:
// import * as DocumentPicker from 'expo-document-picker';
// import * as ImagePicker from 'expo-image-picker';
// import { useEffect } from 'react';
// import { Text } from 'react-native';

// export default function RootLayout() {
//   useEffect(() => {
//     (async () => {
//       try {
//         // Test native module availability
//         await ImagePicker.getMediaLibraryPermissionsAsync();
//         await DocumentPicker.getDocumentAsync({ type: '*/*' });
//         console.log('Native modules loaded successfully!');
//       } catch (error) {
//         console.error('Native module test failed:', error);
//       }
//     })();
//   }, []);

//   return (
//     <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>
//       Testing native modules...
//     </Text>
//   );
// }