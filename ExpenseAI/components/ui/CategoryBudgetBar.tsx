import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Category } from '../../constants/categories';

interface CategoryBudgetBarProps {
  category: Category;
  spent: number;
  budget: number;
}

export function CategoryBudgetBar({ category, spent, budget }: CategoryBudgetBarProps) {
  const Icon = category.icon;
  const progress = Math.min(spent / budget, 1);
  const percentage = Math.round((spent / budget) * 100);
  
  let progressColor = theme.colors.brandPrimary;
  if (percentage > 90) progressColor = theme.colors.expense;
  else if (percentage > 75) progressColor = theme.colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconBox, { backgroundColor: `${category.color}15` }]}>
            <Icon size={16} color={category.color} weight="fill" />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        <Text style={styles.amounts}>
          <Text style={styles.spent}>₹{spent.toLocaleString('en-IN')}</Text>
          <Text style={styles.budget}> / ₹{budget.toLocaleString('en-IN')}</Text>
        </Text>
      </View>
      
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: progressColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurface,
  },
  amounts: {
    fontSize: theme.typography.scale.sm,
  },
  spent: {
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  budget: {
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  barBackground: {
    height: 8,
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
});
