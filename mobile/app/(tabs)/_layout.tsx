import { Tabs } from 'expo-router';
import { usePurchases } from '@/hooks/usePurchases';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const { isProUser, isLoading } = usePurchases();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practise',
        }}
      />
      <Tabs.Screen
        name="verbs"
        options={{
          title: 'Verbs',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favourites',
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: 'Pro',
          href: !isLoading && !isProUser ? '/pro' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
