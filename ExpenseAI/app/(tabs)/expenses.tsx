import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { RecentTransactionItem } from '../../components/ui/RecentTransactionItem';
import { MagnifyingGlass, Funnel } from 'phosphor-react-native';
import { useFocusEffect } from 'expo-router';
import { expenseService } from '../../services/api';

export default function ExpensesScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchExpenses = async () => {
        setIsLoading(true);
        try {
          // Pass empty for all or current month depending on preference. Let's fetch all for this screen.
          // The API expects month/year, if omitted it just uses a generic query or we can fetch a ton.
          // Wait, the API only filters by month/year if provided. So omitting them fetches all!
          const data = await expenseService.getExpenses();
          setExpenses(data);
        } catch (e) {
          console.error("Failed to fetch all expenses", e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchExpenses();
    }, [])
  );

  // Group expenses by date (YYYY-MM-DD string prefix for simplicity)
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const dateStr = expense.date.split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(expense);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <MagnifyingGlass size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Funnel size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {['All', 'Expenses', 'Income'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveTab(filter)}
              style={[styles.filterChip, activeTab === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeTab === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.brandPrimary} style={{ marginTop: 40 }} />
        ) : sortedDates.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: theme.colors.onSurfaceTertiary }}>No transactions found.</Text>
          </View>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDateHeading(date)}</Text>
              <View style={styles.transactionsList}>
                {groupedExpenses[date].map((expense: any, index: number) => {
                  const category = CATEGORIES.find(c => c.id === expense.category_id) || CATEGORIES.find(c => c.id === 'other_expense')!;
                  return (
                    <RecentTransactionItem 
                      key={expense.id || index}
                      title={expense.title}
                      category={category}
                      amount={expense.amount}
                      date={expense.date}
                    />
                  );
                })}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.scale.xl,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: theme.spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceTertiary,
  },
  filterChipActive: {
    backgroundColor: theme.colors.onSurface,
  },
  filterText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceSecondary,
  },
  filterTextActive: {
    color: theme.colors.surface,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  dateGroup: {
    marginBottom: theme.spacing.xl,
  },
  dateHeader: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurfaceSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }
});
