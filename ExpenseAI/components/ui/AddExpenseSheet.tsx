import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';
import { Camera, Image as ImageIcon, FilePdf, PencilSimple, EnvelopeSimple, FileText, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export type AddExpenseSheetRef = {
  present: () => void;
  dismiss: () => void;
};

export const AddExpenseSheet = forwardRef<AddExpenseSheetRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => setVisible(false),
  }));

  const handleOptionPress = (option: string) => {
    setVisible(false);
    setTimeout(() => {
      if (option === 'manual') {
        router.push('/add-manual');
      } else if (option === 'camera' || option === 'gallery' || option === 'pdf') {
        router.push('/receipt-scanner');
      }
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

        <BlurView intensity={140} tint="dark" style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add expense</Text>
          <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
            <X size={22} color="#999" weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>

          {/* Snap Receipt */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('camera')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#1C8AF9' }]}>
              <Camera size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Snap Receipt</Text>
              <Text style={styles.rowSubtitle}>Use your camera to quickly capture expense details.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Upload from Gallery */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('gallery')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#DB28DF' }]}>
              <ImageIcon size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Upload from Gallery</Text>
              <Text style={styles.rowSubtitle}>Add a receipt from your photo gallery.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* PDF Receipt */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('pdf')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#FF453A' }]}>
              <FilePdf size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>PDF Receipt</Text>
              <Text style={styles.rowSubtitle}>Add a PDF receipt to capture expense details.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Enter manually */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('manual')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#8E44AD' }]}>
              <PencilSimple size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Enter manually</Text>
              <Text style={styles.rowSubtitle}>Manually input your transaction details.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Email Receipt */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('email')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#34C759' }]}>
              <EnvelopeSimple size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.rowTitle}>Email Receipt</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>Pro</Text>
                </View>
              </View>
              <Text style={styles.rowSubtitle}>Forward receipts and invoices from your email.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Import Statement */}
          <TouchableOpacity style={styles.row} onPress={() => handleOptionPress('import')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFB340' }]}>
              <FileText size={24} weight="fill" color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.rowTitle}>Import Statement</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>Pro</Text>
                </View>
              </View>
              <Text style={styles.rowSubtitle}>Bulk-import from PDF or Spreadsheet files.</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 40,
    overflow: 'hidden',
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    position: 'relative',
  },
  title: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: '#FFF',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: theme.spacing.lg,
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: theme.typography.scale.lg,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
    marginLeft: theme.spacing.md,
  },
  rowTitle: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: '#FFF',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.textFontFamily,
    color: '#999',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 48 + theme.spacing.md,
  },
  proBadge: {
    backgroundColor: '#1C8AF9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: theme.typography.boldFontFamily,
  },
});
