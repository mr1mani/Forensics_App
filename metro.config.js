const { getDefaultConfig } = require('expo/metro-config');

// module.exports = (() => {
//   const config = getDefaultConfig(__dirname);
//   config.resolver.extraNodeModules = {
//     ...config.resolver.extraNodeModules,
//     'expo-image-picker': require.resolve('expo-image-picker'),
//     'expo-document-picker': require.resolve('expo-document-picker'),
//   };
//   return config;
// })();

const config = getDefaultConfig(__dirname);

// Remove the problematic asset path modification
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix for asset requests
      if (req.url.startsWith('/assets')) {
        // Ensure proper asset path resolution
        req.url = req.url.replace(/^\/assets/, '/assets');
      }
      return middleware(req, res, next);
    };
  },
};

// Add asset extensions (if needed)
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db', // Add any custom extensions here
];

module.exports = config;