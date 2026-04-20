import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  AmaticSC_400Regular,
  AmaticSC_700Bold,
} from '@expo-google-fonts/amatic-sc';
import {
  Manjari_400Regular,
  Manjari_700Bold,
} from '@expo-google-fonts/manjari';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import CustomSplashScreen from '@/components/SplashScreen';
import IntroScreen from '@/components/IntroScreen';
import StartPracticingScreen from '@/components/StartPracticingScreen';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PurchasesProvider } from '@/components/PurchasesProvider';
import { configureRevenueCat } from '@/lib/revenuecat';
import { verbService } from '@/lib/verbService';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://7e72a03af7db7a5f56723457c152a612@o4510583564402688.ingest.de.sentry.io/4510583571808336',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'AmaticSC-Regular': AmaticSC_400Regular,
    'AmaticSC-Bold': AmaticSC_700Bold,
    'Manjari-Regular': Manjari_400Regular,
    'Manjari-Bold': Manjari_700Bold,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showStartPracticing, setShowStartPracticing] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      checkIntro();
    }
  }, [fontsLoaded]);

  const checkIntro = async () => {
    try {
      const hasSeenIntro = await AsyncStorage.getItem('has_seen_intro');
      if (!hasSeenIntro) {
        setShowIntro(true);
      }
    } catch (e) {
      console.error('Failed to check intro status', e);
    }
  };

  const handleIntroNext = () => {
    setShowIntro(false);
    setShowStartPracticing(true);
  };

  const handleStartPracticingFinish = async () => {
    try {
      await AsyncStorage.setItem('has_seen_intro', 'true');
      setShowStartPracticing(false);
    } catch (e) {
      console.error('Failed to save intro status', e);
      setShowStartPracticing(false);
    }
  };

  // Initialize RevenueCat once on app start
  useEffect(() => {
    configureRevenueCat();
  }, []);

  // Preload verbs on app start so all screens have data available
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([verbService.preload('delta')]);
        Sentry.logger.info('[AppInit] Verbs preloaded');
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            feature: 'app-init',
            service: 'verb-preload',
          },
        });
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PurchasesProvider>
        <ThemeProvider>
        {showCustomSplash ? (
          <CustomSplashScreen onFinish={() => setShowCustomSplash(false)} />
        ) : showIntro ? (
          <IntroScreen onFinish={handleIntroNext} />
        ) : showStartPracticing ? (
          <StartPracticingScreen onFinish={handleStartPracticingFinish} />
        ) : (
          <>
            <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </>
        )}
      </ThemeProvider>
      </PurchasesProvider>
    </GestureHandlerRootView>
  );
});
