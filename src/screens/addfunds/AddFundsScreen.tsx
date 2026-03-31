import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFunds'>;

const presetAmounts = [10, 25, 50, 100];

export function AddFundsScreen({ navigation }: Props) {
  const [amountInput, setAmountInput] = useState('25');

  const amount = useMemo(() => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }
    return Math.round(parsed * 100) / 100;
  }, [amountInput]);

  return (
    <View style={styles.screen}>
      <View style={styles.topCard}>
        <Text style={styles.topLabel}>Amount to Add</Text>
        <Text style={styles.topValue}>{formatMoney(amount)}</Text>
      </View>

      <Text style={styles.label}>Choose Amount</Text>
      <View style={styles.presetRow}>
        {presetAmounts.map(value => (
          <TouchableOpacity
            key={value}
            style={[styles.pill, amount === value && styles.pillActive]}
            onPress={() => setAmountInput(String(value))}>
            <Text style={[styles.pillText, amount === value && styles.pillTextActive]}>
              {formatMoney(value)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Custom Amount</Text>
      <TextInput
        value={amountInput}
        onChangeText={setAmountInput}
        keyboardType="decimal-pad"
        placeholder="0.00"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, amount <= 0 && styles.disabled]}
        disabled={amount <= 0}
        onPress={() => navigation.navigate('PaymentMethod', { amount })}>
        <Text style={styles.primaryBtnText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  topCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BEDBFF',
  },
  topLabel: { color: '#4A5565', fontSize: 13 },
  topValue: { marginTop: 4, color: '#111827', fontSize: 34, fontWeight: '800' },
  label: { color: '#374151', fontWeight: '600', marginTop: 6 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: { backgroundColor: '#FFF7ED', borderColor: '#FF5B04' },
  pillText: { color: '#374151', fontWeight: '600' },
  pillTextActive: { color: '#C2410C' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
  },
  primaryBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
