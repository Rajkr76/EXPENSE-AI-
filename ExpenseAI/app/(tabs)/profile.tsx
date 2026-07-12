import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { CaretRight, UserCircle, Bell, ShieldCheck, Export, ChartPieSlice, SignOut, Trash } from 'phosphor-react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { expenseService, incomeService } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // 1. Fetch all expenses
      const allExpenses = await expenseService.getExpenses();
      
      if (!allExpenses || allExpenses.length === 0) {
        Alert.alert('No Data', 'You have no expenses to export.');
        setIsExporting(false);
        return;
      }

      // 2. Build CSV string
      const headers = ['Date', 'Title', 'Merchant', 'Category ID', 'Amount'];
      const csvRows = [headers.join(',')];
      
      allExpenses.forEach((exp: any) => {
        // Escape quotes and wrap in quotes to handle commas in text
        const safeTitle = `"${(exp.title || '').replace(/"/g, '""')}"`;
        const safeMerchant = `"${(exp.merchant || '').replace(/"/g, '""')}"`;
        
        const row = [
          exp.date.split('T')[0], // YYYY-MM-DD
          safeTitle,
          safeMerchant,
          exp.category_id,
          exp.amount.toString()
        ];
        csvRows.push(row.join(','));
      });
      
      const csvString = csvRows.join('\n');
      
      // 3. Save to device file system
      const fileUri = `${(FileSystem as any).documentDirectory}ExpenseAI_Export_${new Date().toISOString().split('T')[0]}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: (FileSystem as any).EncodingType.UTF8 });
      
      // 4. Share file
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (e) {
      console.error('Export error:', e);
      Alert.alert('Error', 'Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetExpenses = () => {
    Alert.alert(
      "Reset Entire Expense",
      "Are you sure you want to reset and delete all your expenses? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Reset", 
          style: "destructive",
          onPress: async () => {
            setIsResetting(true);
            try {
              await Promise.all([
                expenseService.deleteAllExpenses(),
                incomeService.deleteAllIncomes()
              ]);
              Alert.alert('Success', 'All expenses and incomes have been deleted.');
            } catch (e) {
              console.error('Reset error:', e);
              Alert.alert('Error', 'Failed to reset expenses.');
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.firstName?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName || 'User'}</Text>
          <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || ''}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Detailed Analytics & Reports will be available in the next update!')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.brandPrimary}15` }]}>
                <ChartPieSlice size={24} color={theme.colors.brandPrimary} weight="fill" />
              </View>
              <Text style={styles.menuItemTitle}>Analytics & Reports</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.info}15` }]}>
                <UserCircle size={24} color={theme.colors.info} weight="fill" />
              </View>
              <Text style={styles.menuItemTitle}>Account Settings</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.warning}15` }]}>
                <Bell size={24} color={theme.colors.warning} weight="fill" />
              </View>
              <Text style={styles.menuItemTitle}>Notifications</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.success}15` }]}>
                <ShieldCheck size={24} color={theme.colors.success} weight="fill" />
              </View>
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleExportData} disabled={isExporting}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.info}15` }]}>
                {isExporting ? <ActivityIndicator color={theme.colors.info} /> : <Export size={24} color={theme.colors.info} weight="fill" />}
              </View>
              <Text style={styles.menuItemTitle}>Export Data to Excel</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleResetExpenses} disabled={isResetting}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.error}15` }]}>
                {isResetting ? <ActivityIndicator color={theme.colors.error} /> : <Trash size={24} color={theme.colors.error} weight="fill" />}
              </View>
              <Text style={[styles.menuItemTitle, { color: theme.colors.error }]}>Reset entire expenses & incomes</Text>
            </View>
            <CaretRight size={20} color={theme.colors.onSurfaceTertiary} />
          </TouchableOpacity>
        </View>
        
        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
          <SignOut size={24} color={theme.colors.expense} weight="bold" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
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
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    marginTop: theme.spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  name: {
    fontSize: theme.typography.scale.xl,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
    marginBottom: theme.spacing.lg,
  },
  editBtn: {
    backgroundColor: theme.colors.surfaceTertiary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
  },
  editBtnText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurfaceSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    ...theme.shadows.tier1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurface,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    backgroundColor: `${theme.colors.expense}10`,
    borderRadius: theme.radius.xl,
  },
  signOutText: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.expense,
  }
});
