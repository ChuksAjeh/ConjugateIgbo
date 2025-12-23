import { Tabs } from 'expo-router';
import {
  Book,
  Settings,
  Crown,
  Zap,
} from 'lucide-react-native';
import { usePurchases } from '@/hooks/usePurchases';

export default function TabLayout() {
  const { isProUser } = usePurchases();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Inter-SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ size, color }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="verbs"
        options={{
          title: 'Verbs',
          tabBarIcon: ({ size, color }) => <Book size={size} color={color} />,
        }}
      />
      {/* Conditionally render the Pro tab: hide it completely for Pro users */}
      {!isProUser && (
        <Tabs.Screen
          name="pro"
          options={{
            title: 'Get Pro',
            tabBarIcon: ({ size, color }) => (
              <Crown size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />

      {/* Hide non-screen files from the tab bar */}
      <Tabs.Screen
        name="proStyles"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="indexStyles"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settingsStyles"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
