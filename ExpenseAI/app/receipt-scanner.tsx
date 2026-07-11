import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { CATEGORIES } from '../constants/categories';
import { X, Sparkle, Camera, Check, Image as ImageIcon } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

export default function ReceiptScannerScreen() {
  const router = useRouter();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Fields state (populated after scan)
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const pickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      if (useCamera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.7,
        });
      } else {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0]);
      }
    } catch (e) {
      console.error("Image picker error:", e);
    }
  };

  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsScanning(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const formData = new FormData();
      
      formData.append('file', {
        uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://192.168.1.8:8000/api/ai/scan-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to scan receipt');
      
      const data = await response.json();
      
      setScannedData(true);
      setAmount(data.amount ? data.amount.toString() : '');
      setMerchant(data.merchant || '');
      setSelectedCategory(data.category || 'other_expense');
      
    } catch (e) {
      console.error("Scan error:", e);
      alert('Failed to process receipt with AI. Try again.');
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
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await fetch('http://192.168.1.8:8000/api/expenses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: merchant,
          amount: parseFloat(amount),
          merchant: merchant,
          category_id: selectedCategory || 'other_expense',
          date: new Date().toISOString().split('T')[0],
          notes: 'Scanned via AI receipt scanner',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
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
          <Text style={styles.headerTitle}>AI Receipt Scanner</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          {!scannedData ? (
            <View style={styles.scanState}>
              <View style={styles.receiptPlaceholder}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="contain" />
                ) : (
                  <>
                    <Camera size={48} color={theme.colors.onSurfaceTertiary} />
                    <Text style={styles.placeholderText}>Receipt Image</Text>
                  </>
                )}
              </View>
              
              {!isScanning && !imageUri && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
                    <Camera size={24} color={theme.colors.onBrandPrimary} weight="fill" />
                    <Text style={styles.actionBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionBtn, styles.galleryBtn]} onPress={() => pickImage(false)}>
                    <ImageIcon size={24} color={theme.colors.brandPrimary} weight="fill" />
                    <Text style={[styles.actionBtnText, styles.galleryBtnText]}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {isScanning && (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator color={theme.colors.brandSecondary} size="large" />
                  <Text style={styles.scanningText}>Gemini is analyzing your receipt...</Text>
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
                <Text style={styles.label}>Merchant</Text>
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
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Expense</Text>
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
  scanBtn: {
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadows.tier1,
  },
  scanBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  scanBtnText: {
    color: theme.colors.onBrandSecondary,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
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
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionBtnText: {
    color: theme.colors.onSurface,
    fontFamily: theme.typography.semiBoldFontFamily,
    fontSize: theme.typography.scale.base,
  },
  galleryBtn: {
    backgroundColor: `${theme.colors.brandPrimary}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.brandPrimary}30`,
  },
  galleryBtnText: {
    color: theme.colors.brandPrimary,
  },
  scanningContainer: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
});
