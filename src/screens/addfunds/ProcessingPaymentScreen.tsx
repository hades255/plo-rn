import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ProcessingPayment'>;

const MAX_POLLS = 20;
const POLL_MS = 2000;

function isSuccessStatus(status: unknown) {
  const value = String(status ?? '').toLowerCase();
  return value.includes('succeed') || value.includes('success') || value === 'completed';
}

function isFailedStatus(status: unknown) {
  const value = String(status ?? '').toLowerCase();
  return value.includes('fail') || value.includes('cancel');
}

export function ProcessingPaymentScreen({ navigation, route }: Props) {
  const intentId = route.params?.paymentIntentId;
  const amount = route.params?.amount ?? 0;
  const [statusText, setStatusText] = useState('Starting payment…');
  const [failed, setFailed] = useState(false);

  const canPoll = useMemo(() => Boolean(intentId), [intentId]);

  useEffect(() => {
    let mounted = true;
    if (!canPoll) {
      setStatusText('Missing payment intent. Please try again.');
      setFailed(true);
      return () => {
        mounted = false;
      };
    }
    const poll = async () => {
      for (let i = 0; i < MAX_POLLS; i += 1) {
        try {
          const data = await api.payments.getStatus(String(intentId));
          const status = data?.status;
          if (!mounted) {
            return;
          }
          if (isSuccessStatus(status)) {
            navigation.replace('FundsAdded', { amount });
            return;
          }
          if (isFailedStatus(status)) {
            setStatusText('Payment failed. Try a different method.');
            setFailed(true);
            return;
          }
          setStatusText(`Processing${'.'.repeat((i % 3) + 1)}`);
        } catch {
          if (!mounted) {
            return;
          }
          setStatusText('Still processing…');
        }
        await new Promise<void>(resolve => setTimeout(() => resolve(), POLL_MS));
      }
      if (mounted) {
        setStatusText('Payment is taking longer than expected.');
        setFailed(true);
      }
    };
    poll();
    return () => {
      mounted = false;
    };
  }, [amount, canPoll, intentId, navigation]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color="#FF5B04" />
      <Text style={styles.title}>Processing Payment</Text>
      <Text style={styles.subtitle}>{statusText}</Text>

      {failed ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.replace('AddFunds')}>
          <Text style={styles.primaryBtnText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { marginTop: 16, color: '#111827', fontWeight: '800', fontSize: 24 },
  subtitle: { marginTop: 8, color: '#4B5563', textAlign: 'center' },
  primaryBtn: {
    marginTop: 20,
    height: 48,
    minWidth: 180,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5B04',
    paddingHorizontal: 16,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
