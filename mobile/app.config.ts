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

    orientation: 'portrait',
    userInterfaceStyle: 'automatic',

    icon: './assets/images/icon.png',

    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#AD1102',
    },

    newArchEnabled: true,

    ios: {
      supportsTablet: true,
    },

    android: {
      package: 'com.chuksajeh.conjugateigbo',
      permissions: ['POST_NOTIFICATIONS'],
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
    },

    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#000000',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'conjugateigbo',
          organization: 'chuksajeh',
        },
      ],
    ],

    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: '546a41fe-d7a9-4fa6-a467-dd16731f7a5e',
      },
    },

    experiments: {
      typedRoutes: true,
    },
  },
};