@@ .. @@
 import { Tabs } from 'expo-router';
-import { Book, Settings, Crown, Zap, TrendingUp, Music } from 'lucide-react-native';
-import { usePurchases } from '@/hooks/usePurchases';
-import { useTheme } from '@/components/ThemeProvider';
+import { Book, Settings, Crown, Zap, TrendingUp, Music } from 'lucide-react-native';
+import { useAppStore } from '@/store/appStore';

 export default function TabLayout() {
-  const { isProUser } = usePurchases();
+  const { settings } = useAppStore();

   return (
     <Tabs
       screenOptions={{
         headerShown: false,
-        tabBarActiveTintColor: '#3b82f6',
-        tabBarInactiveTintColor: '#9ca3af',
+        tabBarActiveTintColor: '#059669',
+        tabBarInactiveTintColor: '#6b7280',
+        tabBarStyle: {
+          backgroundColor: '#ffffff',
+          borderTopColor: '#e5e7eb',
+          paddingBottom: 8,
+          height: 88,
+        },
         tabBarLabelStyle: {
           fontSize: 12,
           fontWeight: '500',
           fontFamily: 'Inter-SemiBold',
+          marginTop: 4,
         },
       }}>
       <Tabs.Screen
         name="index"
         options={{
           title: 'Practice',
           tabBarIcon: ({ size, color }) => (
             <Zap size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
         name="rhymes"
         options={{
           title: 'Rhymes',
           tabBarIcon: ({ size, color }) => (
             <Music size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
         name="verbs"
         options={{
           title: 'Verbs',
           tabBarIcon: ({ size, color }) => (
             <Book size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
-        name="pro"
+        name="progress"
         options={{
-          title: isProUser ? 'Pro' : 'Get Pro',
+          title: 'Progress',
           tabBarIcon: ({ size, color }) => (
-            <Crown size={size} color={color} />
+            <TrendingUp size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
-        name="progress"
+        name="pro"
         options={{
-          title: 'Progress',
+          title: settings.isPremium ? 'Pro' : 'Get Pro',
           tabBarIcon: ({ size, color }) => (
-            <TrendingUp size={size} color={color} />
+            <Crown size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
         name="settings"
         options={{
           title: 'Settings',
           tabBarIcon: ({ size, color }) => (
             <Settings size={size} color={color} />
           ),
         }}
       />
     </Tabs>
   );
 }