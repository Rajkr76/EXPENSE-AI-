import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { LineChart } from 'react-native-gifted-charts';

interface ExpenseTrendChartProps {
  expenses?: any[];
}

export function ExpenseTrendChart({ expenses = [] }: ExpenseTrendChartProps) {
  // Generate last 7 days data
  const lineData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    const dayTotal = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
      
    return { value: dayTotal || 0 };
  });

  // If all values are 0, provide a flat line at 0
  const maxVal = Math.max(...lineData.map(d => d.value));
  if (maxVal === 0) {
    lineData.forEach(d => d.value = 0.1); // slight offset to render line
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week's Trend</Text>
      </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={lineData}
          height={120}
          width={280}
          spacing={40}
          initialSpacing={10}
          maxValue={maxVal > 0 ? maxVal * 1.3 : 100} // Adds 30% headroom to prevent curve clipping
          color={theme.colors.brandSecondary}
          thickness={3}
          dataPointsColor={theme.colors.brandSecondary}
          dataPointsRadius={4}
          hideRules
          hideYAxisText
          hideAxesAndRules
          curved
          isAnimated
          animationDuration={1200}
          startFillColor={theme.colors.brandSecondary}
          startOpacity={0.2}
          endFillColor={theme.colors.brandSecondary}
          endOpacity={0.01}
          yAxisOffset={0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.tier1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    paddingVertical: 15,
  }
});
