import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Sparkle } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export function AIChatPill() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9} 
      onPress={() => router.push('/ai-chat')}
    >
      <LinearGradient
        colors={[theme.colors.brandSecondary, '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Sparkle size={20} color={theme.colors.onBrandSecondary} weight="fill" />
        <Text style={styles.text}>Ask me about your finances...</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150, // Position well above the tab bar + FAB
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    ...theme.shadows.tier1,
    zIndex: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    gap: theme.spacing.sm,
  },
  text: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onBrandSecondary,
  },
});
