import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { CATEGORIES } from '../constants/categories';
import { X, CalendarBlank, CaretDown } from 'phosphor-react-native';
import { expenseService } from '../services/api';

export default function AddManualScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [customCategory, setCustomCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    if (!amount || !title) {
      Alert.alert('Missing fields', 'Please enter an amount and description.');
      return;
    }
    
    setIsLoading(true);
    try {
      await expenseService.addExpense({
        title: title,
        amount: parseFloat(amount),
        merchant: title,
        category_id: selectedCategory,
        date: new Date().toISOString().split('T')[0],
        notes: selectedCategory === 'other_expense' && customCategory ? `Custom Category: ${customCategory}` : '',
      });
      
      Alert.alert('Success', 'Expense saved!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Could not save expense. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.amountSection}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={theme.colors.onSurfaceTertiary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>What was this for?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Starbucks Coffee"
              placeholderTextColor={theme.colors.onSurfaceTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.filter(c => c.type === 'expense').map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
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

          {selectedCategory === 'other_expense' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>What type of expense is this?</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your category here"
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                value={customCategory}
                onChangeText={setCustomCategory}
              />
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dropdownBtn}>
                <CalendarBlank size={20} color={theme.colors.onSurfaceSecondary} />
                <Text style={styles.dropdownText}>Today</Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: theme.spacing.lg }} />

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Account</Text>
              <TouchableOpacity style={styles.dropdownBtn}>
                <Text style={styles.dropdownText}>HDFC Bank</Text>
                <CaretDown size={16} color={theme.colors.onSurfaceTertiary} />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onBrandPrimary} />
            ) : (
              <Text style={styles.saveBtnText}>Save Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  container: {
    padding: theme.spacing.xl,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing['2xl'],
  },
  currencySymbol: {
    fontSize: 48,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 64,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
    minWidth: 100,
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
  row: {
    flexDirection: 'row',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  dropdownText: {
    flex: 1,
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurface,
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveBtn: {
    backgroundColor: theme.colors.brandPrimary,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.tier1,
  },
  saveBtnText: {
    color: theme.colors.onBrandPrimary,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
});
