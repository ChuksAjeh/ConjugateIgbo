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
import { initSentry, Sentry } from '@/lib/sentry';
import { logger } from '@/lib/logger';
import { verbService } from '@/lib/verbService';
import { useSettings } from '@/hooks/useSettings';

initSentry();

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
      logger.error(e, 'Failed to check intro status', {
        feature: 'onboarding',
        component: 'RootLayout',
      });
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
      logger.error(e, 'Failed to save intro status', {
        feature: 'onboarding',
        component: 'RootLayout',
      });
      setShowStartPracticing(false);
    }
  };

  // Preload verbs for the current dialect so screens render without a
  // data-fetch flash. Re-runs when the user switches dialect from Settings.
  const { settings } = useSettings();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await verbService.preload(settings.dialect);
        if (cancelled) return;
        logger.info('[AppInit] Verbs preloaded', {
          feature: 'app-init',
          component: 'RootLayout',
          tags: { dialect: settings.dialect },
        });
      } catch (error) {
        logger.error(error, 'Failed to preload verbs', {
          feature: 'app-init',
          component: 'verb-preload',
          tags: { dialect: settings.dialect },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.dialect]);

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
