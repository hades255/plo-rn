import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleGaming'>;

const ITEMS = [
  {
    title: 'Lottery Spending Limits',
    desc: 'Set daily, weekly, or monthly spend boundaries.',
    route: 'SpendingLimits' as const,
  },
  {
    title: 'Cool-Off Period',
    desc: 'Take a short break from play.',
    route: 'CoolOff' as const,
  },
  {
    title: 'Self-Exclusion',
    desc: 'Set a longer-term exclusion period.',
    route: 'SelfExclusion' as const,
  },
];

export function ResponsibleGamingScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Responsible Gaming</Text>
      <Text style={styles.sub}>
        Use these tools to manage your play with limits or time-away options.
      </Text>
      {ITEMS.map(item => (
        <TouchableOpacity
          key={item.title}
          style={styles.card}
          onPress={() => navigation.navigate(item.route)}>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#4B5563', marginBottom: 6 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { color: '#111827', fontWeight: '700' },
  cardBody: { flex: 1 },
  cardDesc: { color: '#6B7280', marginTop: 3 },
  arrow: { color: '#9CA3AF', fontSize: 24 },
});
