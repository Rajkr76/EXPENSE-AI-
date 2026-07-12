import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../constants/theme';

export default function ShareHandlerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (params.type && params.value) {
      const type = params.type as string;
      const value = params.value as string;

      // Handle Images
      if (type.startsWith('image') || type.startsWith('media') || type.toLowerCase().includes('image')) {
        router.replace({ 
          pathname: '/receipt-scanner', 
          params: { autoScanUri: value } 
        });
      } 
      // Handle Text (like SMS)
      else if (type.startsWith('text') || typeof value === 'string') {
        router.replace({ 
          pathname: '/text-scanner', 
          params: { textContent: value } 
        });
      } 
      // Unknown type
      else {
        router.back();
      }
    } else {
      router.back();
    }
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
