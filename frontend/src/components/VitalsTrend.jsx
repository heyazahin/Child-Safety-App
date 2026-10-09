import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

export default function VitalsTrend({
  readings,
  field,
  color = COLORS.secondary,
  height = 44,
  emptyLabel = 'No reading history',
}) {
  const points = readings
    .map(reading => ({ reading, value: Number(reading[field]) }))
    .filter(point => Number.isFinite(point.value));
  const values = points.map(point => point.value);

  if (!values.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(Math.abs(max) * 0.1, 1);

  return (
    <View
      accessibilityLabel={`${field} trend from ${values.length} sensor readings`}
      style={[styles.chart, { height }]}
    >
      {points.map(({ reading, value }, index) => (
        <View key={`${reading.timestamp || index}-${index}`} style={styles.barSlot}>
          <View
            style={[
              styles.bar,
              {
                backgroundColor: color,
                height: `${Math.max(12, ((value - min) / range) * 88 + 12)}%`,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    overflow: 'hidden',
  },
  barSlot: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 1,
  },
  bar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minWidth: 3,
    width: '65%',
  },
  empty: {
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
});
