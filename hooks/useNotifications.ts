import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const scheduleDailyReminder = async (time: string) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (Platform.OS === 'web') {
        console.log('Push notifications not supported on web');
        return;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);

      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to practice Igbo! 🦁',
          body: 'Keep your streak going with today\'s verb practice',
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log('Daily reminder scheduled for', time);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelDailyReminder = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Daily reminders cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
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
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  try {
    token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Replace with your actual project ID
    });
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  return token.data;
}