const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'expo-image-picker': require.resolve('expo-image-picker'),
    'expo-document-picker': require.resolve('expo-document-picker'),
  };
  return config;
})();