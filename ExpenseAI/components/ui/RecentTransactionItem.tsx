import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Category } from '../../constants/categories';

interface RecentTransactionItemProps {
  title: string;
  category: Category;
  amount: number;
  date: string;
  onPress?: () => void;
}

export function RecentTransactionItem({ title, category, amount, date, onPress }: RecentTransactionItemProps) {
  const Icon = category.icon;
  const isIncome = category.type === 'income';

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.container}>
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
          <Icon size={24} color={category.color} weight="fill" />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: isIncome ? theme.colors.success : theme.colors.onSurface }]}>
          {isIncome ? '+' : '-'}₹{Math.abs(amount).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  categoryName: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
  date: {
    fontSize: theme.typography.scale.xs,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
});
