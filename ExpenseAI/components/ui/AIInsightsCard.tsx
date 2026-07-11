import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Sparkle, ArrowRight } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AIInsightsCardProps {
  insight: string;
  onPress?: () => void;
}

export function AIInsightsCard({ insight, onPress }: AIInsightsCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={[theme.colors.brandSecondary, '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Sparkle size={20} color={theme.colors.onBrandSecondary} weight="fill" />
            <Text style={styles.title}>AI Insight</Text>
          </View>
          <ArrowRight size={20} color={theme.colors.onBrandSecondary} />
        </View>
        <Text style={styles.insight}>{insight}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.md,
    ...theme.shadows.tier1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: theme.typography.scale.base,
    color: theme.colors.onBrandSecondary,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
  insight: {
    fontSize: theme.typography.scale.lg,
    color: theme.colors.onBrandSecondary,
    fontFamily: theme.typography.mediumFontFamily,
    lineHeight: 24,
  },
});
