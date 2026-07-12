import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../cache';
import { useColorScheme } from 'react-native';
import { theme } from '@/constants/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useRouter, useSegments } from 'expo-router';
import { registerGetToken } from '@/services/api';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // App uses light theme primarily per design guidelines
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.surface,
      text: theme.colors.onSurface,
      primary: theme.colors.brandPrimary,
    },
  };

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={customTheme}>
          <ClerkLoaded>
            <BottomSheetModalProvider>
              <RootLayoutNav />
            </BottomSheetModalProvider>
          </ClerkLoaded>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Register the Clerk getToken function with our Axios API instance
    // so it dynamically fetches a fresh token before every API request!
    registerGetToken(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-manual" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="ai-chat" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="receipt-scanner" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
