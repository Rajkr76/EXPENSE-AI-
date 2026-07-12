import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { AIInsightsCard } from '../../components/ui/AIInsightsCard';
import { ExpenseTrendChart } from '../../components/ui/ExpenseTrendChart';
import { RecentTransactionItem } from '../../components/ui/RecentTransactionItem';
import { AIChatPill } from '../../components/ui/AIChatPill';
import { Wallet, TrendUp, Bank, Target } from 'phosphor-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { expenseService, incomeService, budgetService, aiService } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // Fetch current month's data
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          const [fetchedExpenses, fetchedIncomes, fetchedBudgets] = await Promise.all([
            expenseService.getExpenses(currentMonth, currentYear),
            incomeService.getIncomes(currentMonth, currentYear),
            budgetService.getBudgets(currentMonth, currentYear)
          ]);

          setExpenses(fetchedExpenses);
          setIncomes(fetchedIncomes);
          setBudgets(fetchedBudgets);

          // Only fetch insight after data is loaded so backend sees latest data
          try {
            const aiData = await aiService.getInsight();
            setInsight(aiData.insight);
          } catch (e) {
            console.error('Failed to fetch insight', e);
          }
        } catch (e) {
          console.error('Failed to fetch dashboard data', e);
        } finally {
          setLoadingData(false);
          setLoadingInsight(false);
        }
      };

      if (isLoaded && user) {
        fetchData();
      }
    }, [user, isLoaded])
  );

  // Calculations
  const calculateTodaySpend = () => {
    const today = new Date().toISOString().split('T')[0];
    return expenses
      .filter(e => e.date.startsWith(today))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateTotalSpend = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  };

  const calculateTotalSavings = () => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalSpend = calculateTotalSpend();
    return totalIncome - totalSpend;
  };

  const todaySpend = calculateTodaySpend();
  const totalSpend = calculateTotalSpend();
  const totalBudget = calculateTotalBudget();
  const totalSavings = calculateTotalSavings();

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Guest'}</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.firstName?.charAt(0).toUpperCase() || 'G'}</Text>
          </View>
        </View>

        {loadingData ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
            <Text style={{ marginTop: 16, color: theme.colors.onSurfaceSecondary }}>Loading your finances...</Text>
          </View>
        ) : (
          <>
            {/* Horizontal Summary Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll} style={styles.cardsContainer}>
              <SummaryCard 
                title="Today's Spend" 
                amount={formatCurrency(todaySpend)} 
                icon={TrendUp} 
                color={theme.colors.expense} 
              />
              <SummaryCard 
                title="Monthly Budget" 
                amount={formatCurrency(totalSpend)} 
                subtitle={`${formatCurrency(totalBudget)} Total`}
                icon={Target} 
                color={theme.colors.info} 
              />
              <SummaryCard 
                title="Total Savings" 
                amount={formatCurrency(totalSavings)} 
                icon={Bank} 
                color={totalSavings >= 0 ? theme.colors.success : theme.colors.expense} 
              />
            </ScrollView>

            {/* Expense Trend */}
            <View style={styles.section}>
              <ExpenseTrendChart expenses={expenses} />
            </View>

            {/* AI Insights */}
            <View style={styles.section}>
              {loadingInsight ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color={theme.colors.brandSecondary} />
                </View>
              ) : (
                <AIInsightsCard 
                  insight={insight || "Track more expenses to get personalized AI insights."}
                  onPress={() => router.push('/ai-chat')}
                />
              )}
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => router.push('/expenses')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.transactionsList}>
                {expenses.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.onSurfaceTertiary }}>No expenses yet. Add one!</Text>
                  </View>
                ) : (
                  expenses.slice(0, 5).map((expense, index) => {
                    const category = CATEGORIES.find(c => c.id === expense.category_id) || CATEGORIES.find(c => c.id === 'other_expense')!;
                    // Format date nicely (e.g. "Today" or specific date)
                    const isToday = expense.date.startsWith(new Date().toISOString().split('T')[0]);
                    return (
                      <RecentTransactionItem 
                        key={expense.id || index}
                        title={expense.title}
                        category={category}
                        amount={expense.amount}
                        date={isToday ? 'Today' : expense.date}
                      />
                    );
                  })
                )}
              </View>
            </View>
          </>
        )}
        
        {/* Bottom spacing for TabBar + Pill */}
        <View style={{ height: 160 }} />
      </ScrollView>
      <AIChatPill />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  userName: {
    fontSize: theme.typography.scale['2xl'],
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  cardsContainer: {
    marginBottom: theme.spacing.lg,
  },
  cardsScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingRight: theme.spacing.xl, // Extra padding for last card
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  seeAll: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.brandSecondary,
  },
  transactionsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
  }
});
