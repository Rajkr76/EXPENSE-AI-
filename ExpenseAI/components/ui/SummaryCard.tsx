import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { IconProps } from 'phosphor-react-native';

interface SummaryCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ElementType<IconProps>;
  color: string;
}

export function SummaryCard({ title, amount, subtitle, trend, trendValue, icon: Icon, color }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={24} color={color} weight="fill" />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? theme.colors.surfaceInverse : theme.colors.surfaceTertiary }]}>
            <Text style={[styles.trendText, { color: trend === 'up' ? theme.colors.onSurfaceInverse : theme.colors.onSurfaceTertiary }]}>
              {trend === 'up' ? '↗' : '↘'} {trendValue}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    width: 160,
    marginRight: theme.spacing.md,
    ...theme.shadows.tier1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  trendText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: theme.typography.scale.sm,
    color: theme.colors.onSurfaceTertiary,
    fontFamily: theme.typography.mediumFontFamily,
  },
  amount: {
    fontSize: theme.typography.scale.xl,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.displayFontFamily,
  },
  subtitle: {
    fontSize: theme.typography.scale.sm,
    color: theme.colors.onSurfaceTertiary,
    fontFamily: theme.typography.textFontFamily,
  },
});
