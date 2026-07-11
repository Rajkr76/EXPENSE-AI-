import { View, TouchableOpacity, StyleSheet, Platform, Text, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { House, Receipt, Wallet, User, Plus } from 'phosphor-react-native';
import { useRef } from 'react';
import { AddExpenseSheet, AddExpenseSheetRef } from './AddExpenseSheet';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddExpenseSheetRef>(null);

  const handleFabPress = () => {
    sheetRef.current?.present();
  };

  const TAB_HEIGHT = 64;
  const FAB_SIZE = 64;

  return (
    <>
      {/* Bottom Sheet must be rendered OUTSIDE the tab bar View */}
      <AddExpenseSheet ref={sheetRef} />

      {/* Tab bar */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>

        <View style={styles.content}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            let Icon = House;
            if (route.name === 'index') Icon = House;
            if (route.name === 'expenses') Icon = Receipt;
            if (route.name === 'income-budget') Icon = Wallet;
            if (route.name === 'profile') Icon = User;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={(options as any).tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Icon
                  size={28}
                  weight={isFocused ? 'fill' : 'regular'}
                  color={isFocused ? theme.colors.brandPrimary : theme.colors.onSurfaceTertiary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FAB rendered completely outside and above everything */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom: insets.bottom + TAB_HEIGHT / 2,
          }
        ]}
        onPress={handleFabPress}
        activeOpacity={0.85}
      >
        <Plus size={32} weight="bold" color={theme.colors.onBrandPrimary} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    elevation: 8,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

