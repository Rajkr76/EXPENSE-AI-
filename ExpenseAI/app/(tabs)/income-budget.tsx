import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { CategoryBudgetBar } from '../../components/ui/CategoryBudgetBar';
import { useFocusEffect } from 'expo-router';
import { expenseService, budgetService, incomeService } from '../../services/api';
import { X, Plus, CaretDown } from 'phosphor-react-native';

export default function IncomeBudgetScreen() {
  const [activeTab, setActiveTab] = useState<'budget' | 'income'>('budget');
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  // Form states
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('food');
  
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [exp, bdg, inc] = await Promise.all([
        expenseService.getExpenses(currentMonth, currentYear),
        budgetService.getBudgets(currentMonth, currentYear),
        incomeService.getIncomes(currentMonth, currentYear)
      ]);
      setExpenses(exp);
      setBudgets(bdg);
      setIncomes(inc);
    } catch (e) {
      console.error('Failed to fetch budget data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSaveBudget = async () => {
    if (!budgetAmount) return;
    try {
      await budgetService.setBudget({
        category_id: budgetCategory,
        amount: parseFloat(budgetAmount),
        month: currentMonth,
        year: currentYear
      });
      setShowBudgetModal(false);
      setBudgetAmount('');
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleSaveIncome = async () => {
    if (!incomeAmount || !incomeSource) return;
    try {
      await incomeService.addIncome({
        title: incomeSource,
        amount: parseFloat(incomeAmount),
        source: incomeSource,
        date: new Date().toISOString(),
        notes: ''
      });
      setShowIncomeModal(false);
      setIncomeAmount('');
      setIncomeSource('');
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to add income');
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) : 0;
  const leftForMonth = Math.max(0, totalBudget - totalSpent);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const renderBudgetView = () => (
    <View style={styles.content}>
      <View style={styles.chartSection}>
        <CircularProgress 
          size={200}
          strokeWidth={16}
          progress={budgetProgress}
          color={budgetProgress > 0.9 ? theme.colors.error : theme.colors.brandPrimary}
          title={formatCurrency(totalSpent)}
          subtitle={`Spent of ${formatCurrency(totalBudget)}`}
        />
        <Text style={styles.chartSubtitle}>You have {formatCurrency(leftForMonth)} left for this month</Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Category Budgets</Text>
        <TouchableOpacity style={styles.addSmallBtn} onPress={() => setShowBudgetModal(true)}>
          <Plus size={16} color={theme.colors.brandPrimary} weight="bold" />
          <Text style={styles.addSmallBtnText}>Add to Budget</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {budgets.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.onSurfaceTertiary }}>No budgets set. Click 'Add to Budget' to start managing expenses.</Text>
          </View>
        ) : (
          budgets.map((budget, index) => {
            const cat = CATEGORIES.find(c => c.id === budget.category_id);
            if (!cat) return null;
            
            const spentOnCategory = expenses
              .filter(e => e.category_id === budget.category_id)
              .reduce((sum, e) => sum + e.amount, 0);
              
            return (
              <CategoryBudgetBar 
                key={budget.id || budget._id || `budget-${index}`}
                category={cat} 
                spent={spentOnCategory} 
                budget={budget.amount} 
              />
            );
          })
        )}
      </View>
    </View>
  );

  const renderIncomeView = () => (
    <View style={styles.content}>
      <View style={styles.incomeHeader}>
        <Text style={styles.incomeTitle}>Total Income</Text>
        <Text style={styles.incomeAmount}>{formatCurrency(totalIncome)}</Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Income Sources</Text>
        <TouchableOpacity style={styles.addSmallBtn} onPress={() => setShowIncomeModal(true)}>
          <Plus size={16} color={theme.colors.brandPrimary} weight="bold" />
          <Text style={styles.addSmallBtnText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {incomes.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.onSurfaceTertiary }}>No income added yet.</Text>
          </View>
        ) : (
          incomes.map((income, index) => (
            <View key={income.id || income._id || `income-${index}`} style={styles.incomeRow}>
              <View style={styles.incomeIcon}>
                <Text style={styles.incomeIconText}>💰</Text>
              </View>
              <View style={styles.incomeDetails}>
                <Text style={styles.incomeName}>{income.title}</Text>
                <Text style={styles.incomeDate}>{new Date(income.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.incomeAmountItem}>+{formatCurrency(income.amount)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget & Income</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={[styles.segmentBtn, activeTab === 'budget' && styles.segmentBtnActive]} 
          onPress={() => setActiveTab('budget')}
        >
          <Text style={[styles.segmentText, activeTab === 'budget' && styles.segmentTextActive]}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentBtn, activeTab === 'income' && styles.segmentBtnActive]} 
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.segmentText, activeTab === 'income' && styles.segmentTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.brandPrimary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'budget' ? renderBudgetView() : renderIncomeView()}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Category Budget</Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <X size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.filter(c => c.type === 'expense').map((cat) => {
                  const isSelected = budgetCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setBudgetCategory(cat.id)}
                      style={[
                        styles.categoryChip,
                        isSelected && { backgroundColor: `${cat.color}15`, borderColor: cat.color }
                      ]}
                    >
                      <Icon size={20} color={isSelected ? cat.color : theme.colors.onSurfaceTertiary} weight={isSelected ? "fill" : "regular"} />
                      <Text style={[styles.categoryText, isSelected && { color: cat.color, fontFamily: theme.typography.mediumFontFamily }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Monthly Limit (₹)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="decimal-pad" 
                placeholder="0" 
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBudget}>
              <Text style={styles.saveBtnText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Income Modal */}
      <Modal visible={showIncomeModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Income</Text>
              <TouchableOpacity onPress={() => setShowIncomeModal(false)}>
                <X size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Source (e.g. Salary, Freelance)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Income source" 
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                value={incomeSource}
                onChangeText={setIncomeSource}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="decimal-pad" 
                placeholder="0" 
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                value={incomeAmount}
                onChangeText={setIncomeAmount}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveIncome}>
              <Text style={styles.saveBtnText}>Save Income</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.scale.xl,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceTertiary,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.tier1,
  },
  segmentText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  segmentTextActive: {
    color: theme.colors.onSurface,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.xl,
  },
  chartSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  chartSubtitle: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.brandPrimary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    gap: 4,
  },
  addSmallBtnText: {
    color: theme.colors.brandPrimary,
    fontFamily: theme.typography.semiBoldFontFamily,
    fontSize: theme.typography.scale.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.tier1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  incomeHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.radius.xl,
  },
  incomeTitle: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.success,
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 40,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.success,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  incomeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  incomeIconText: {
    fontSize: 24,
  },
  incomeDetails: {
    flex: 1,
  },
  incomeName: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  incomeDate: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  incomeAmountItem: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.success,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  formGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurface,
  },
  categoryScroll: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  saveBtn: {
    backgroundColor: theme.colors.brandPrimary,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  saveBtnText: {
    color: theme.colors.onBrandPrimary,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
});
