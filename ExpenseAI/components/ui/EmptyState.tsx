import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Ghost } from 'phosphor-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: any;
}

export function EmptyState({ title, description, icon: Icon = Ghost }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={48} color={theme.colors.onSurfaceTertiary} weight="light" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['3xl'],
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  title: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
