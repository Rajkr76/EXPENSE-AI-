import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { CATEGORIES } from '../constants/categories';
import { X, Sparkle, Check, TextAa } from 'phosphor-react-native';
import { api, expenseService } from '../services/api';

export default function TextScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const textContent = params.textContent as string | undefined;
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  
  // Fields state (populated after scan)
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (textContent) {
      processText(textContent);
    }
  }, [textContent]);

  const processText = async (text: string) => {
    setIsScanning(true);
    try {
      const response = await api.post('/ai/scan-text', { text });
      const data = response.data;
      
      setScannedData(true);
      setAmount(data.amount ? data.amount.toString() : '');
      setMerchant(data.merchant || '');
      setSelectedCategory(data.category || 'other_expense');
      
    } catch (e) {
      console.error("Scan error:", e);
      alert('Failed to process text with AI. Try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!amount || !merchant) {
      alert('Please fill in amount and merchant');
      return;
    }
    
    setIsSaving(true);
    try {
      await expenseService.addExpense({
        title: merchant,
        amount: parseFloat(amount),
        merchant: merchant,
        category_id: selectedCategory || 'other_expense',
        date: new Date().toISOString().split('T')[0],
        notes: 'Extracted from shared text',
      });
      
      alert('Expense saved!');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Save error:', e);
      alert('Could not save expense.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Text Scanner</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          {!scannedData ? (
            <View style={styles.scanState}>
              <View style={styles.receiptPlaceholder}>
                <TextAa size={48} color={theme.colors.onSurfaceTertiary} />
                <Text style={styles.placeholderText}>Analyzing Text...</Text>
              </View>
              
              {isScanning && (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator color={theme.colors.brandSecondary} size="large" />
                  <Text style={styles.scanningText}>Gemini is analyzing your text...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.reviewState}>
              <View style={styles.successBanner}>
                <Check size={20} color={theme.colors.success} weight="bold" />
                <Text style={styles.successText}>Extracted successfully</Text>
              </View>
              
              <View style={styles.amountSection}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Merchant / Sender</Text>
                <TextInput
                  style={styles.input}
                  value={merchant}
                  onChangeText={setMerchant}
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
              
            </View>
          )}

        </ScrollView>
        
        {scannedData && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color={theme.colors.onBrandPrimary} />
              ) : (
                <Text style={styles.saveBtnText}>Save Expense</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    flexGrow: 1,
  },
  scanState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptPlaceholder: {
    width: 240,
    height: 320,
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderStrong,
  },
  placeholderText: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceTertiary,
  },
  scanningText: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.brandSecondary,
  },
  reviewState: {
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}15`,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  successText: {
    color: theme.colors.success,
    fontFamily: theme.typography.mediumFontFamily,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['2xl'],
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
  scanningContainer: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
});
