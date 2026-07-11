import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { theme } from '../../constants/theme';
import { Trash, PencilSimple } from 'phosphor-react-native';
import { Category } from '../../constants/categories';

interface SwipeableExpenseItemProps {
  title: string;
  category: Category;
  amount: number;
  date: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SwipeableExpenseItem({ title, category, amount, date, onEdit, onDelete }: SwipeableExpenseItemProps) {
  const Icon = category.icon;

  const renderRightActions = () => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.warning }]} onPress={onEdit}>
          <PencilSimple size={24} color={theme.colors.onWarning} weight="fill" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.expense }]} onPress={onDelete}>
          <Trash size={24} color={theme.colors.onExpense} weight="fill" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.container}>
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
          <Text style={styles.amount}>-₹{Math.abs(amount).toLocaleString('en-IN')}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.onSurface,
  },
  date: {
    fontSize: theme.typography.scale.xs,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 72,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
