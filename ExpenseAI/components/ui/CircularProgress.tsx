import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color: string;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = theme.colors.surfaceTertiary,
  title,
  subtitle
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            stroke={backgroundColor}
            fill="transparent"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <Circle
            stroke={color}
            fill="transparent"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {(title || subtitle) && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.textContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.scale['2xl'],
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceTertiary,
    marginTop: 2,
  },
});
