import 'dotenv/config';

export default {
  expo: {
    owner: 'chuksajeh',
    name: 'Conjugate Igbo',
    slug: 'conjugate-igbo',
    version: '1.0.0',

    runtimeVersion: {
      policy: 'appVersion',
    },

    orientation: 'default',
    userInterfaceStyle: 'automatic',

    icon: './assets/images/app-icon.png',
    backgroundColor: '#8B0000',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#8B0000',
    },

    newArchEnabled: true,

    ios: {
      bundleIdentifier: 'com.chuksajeh.conjugateigbo',
      icon: './assets/images/app-icon.png',
      splash: {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#8B0000',
        tabletImage: './assets/images/splash-icon.png',
      },
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      package: 'com.chuksajeh.conjugateigbo',
      icon: './assets/images/app-icon.png',
      permissions: ['POST_NOTIFICATIONS'],
      adaptiveIcon: {
        foregroundImage: './assets/images/icon-adaptive-foreground.png',
        backgroundColor: '#8B0000',
      },
    },

    plugins: [
      '@react-native-community/datetimepicker',
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          backgroundColor: '#8B0000',
          imageWidth: 88,
          resizeMode: 'contain',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#8B0000',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'conjugateigbo',
          organization: 'threeleavestechnology',
        },
      ],
    ],

    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: '546a41fe-d7a9-4fa6-a467-dd16731f7a5e',
      },
    },

    web: {
      favicon: './assets/images/logo.png',
      bundler: 'metro',
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
