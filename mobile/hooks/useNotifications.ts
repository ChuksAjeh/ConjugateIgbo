import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  useEffect(() => {
    let notificationSubscription: Notifications.Subscription | undefined;
    let responseSubscription: Notifications.Subscription | undefined;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications
    notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    responseSubscription =
      Notifications.addNotificationResponseReceivedListener((_response) => {
        console.info('[useNotifications] Notification response:', _response);
      });

    return () => {
      notificationSubscription?.remove();
      responseSubscription?.remove();
    };
  }, []);

  const scheduleDailyReminder = async (time: string) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (Platform.OS === 'web') {
        console.warn('[useNotifications] Push notifications not supported on web');
        return;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);

      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to practice Igbo! 🦁',
          body: "Keep your streak going with today's verb practice",
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      console.info('[useNotifications] Daily reminder scheduled for', time);
    } catch(error: any) {
      console.error('[useNotifications] Error scheduling notification:', error);
    }
  };

  const cancelDailyReminder = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.info('[useNotifications] Daily reminders cancelled');
    } catch(error: any) {
      console.error('[useNotifications] Error cancelling notifications:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    scheduleDailyReminder,
    cancelDailyReminder,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    // Web doesn't support push notifications in the same way
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[useNotifications] Failed to get push token for push notification!');
    return null;
  }

  try {
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  } catch(error: any) {
    console.error('[useNotifications] Error getting push token:', error);
    return null;
  }

  return token.data;
}
