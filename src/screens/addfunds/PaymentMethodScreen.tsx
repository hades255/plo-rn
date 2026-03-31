import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>;

type Method = 'credit' | 'digital';

export function PaymentMethodScreen({ navigation, route }: Props) {
  const [method, setMethod] = useState<Method | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const amount = useMemo(() => Number(route.params?.amount ?? 0), [route.params?.amount]);

  const startPayment = async () => {
    if (!method || amount <= 0 || submitting) {
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.payments.startAddFunds({ amount, method });
      navigation.replace('ProcessingPayment', {
        amount,
        paymentIntentId: String(res?.paymentIntentId ?? ''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Add</Text>
        <Text style={styles.amountValue}>{formatMoney(amount)}</Text>
      </View>

      <Text style={styles.label}>Select Payment Method</Text>

      <TouchableOpacity
        style={[styles.methodCard, method === 'credit' && styles.methodCardActive]}
        onPress={() => setMethod('credit')}>
        <Text style={styles.methodTitle}>Credit / Debit Card</Text>
        <Text style={styles.methodSub}>Visa, Mastercard, Amex</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.methodCard, method === 'digital' && styles.methodCardActive]}
        onPress={() => setMethod('digital')}>
        <Text style={styles.methodTitle}>Digital Wallet</Text>
        <Text style={styles.methodSub}>Apple Pay, Google Pay</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, (!method || submitting) && styles.disabled]}
        disabled={!method || submitting}
        onPress={startPayment}>
        <Text style={styles.primaryBtnText}>
          {submitting ? 'Processing…' : 'Continue to Payment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  amountCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  amountLabel: { color: '#9A3412', fontSize: 13 },
  amountValue: { fontWeight: '800', fontSize: 32, color: '#C2410C', marginTop: 4 },
  label: { color: '#111827', fontWeight: '700', marginTop: 6 },
  methodCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },
  methodCardActive: { borderColor: '#FF5B04', backgroundColor: '#FFF7ED' },
  methodTitle: { color: '#111827', fontWeight: '700' },
  methodSub: { color: '#6B7280', marginTop: 3 },
  error: { color: '#B91C1C', marginTop: 4 },
  primaryBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
