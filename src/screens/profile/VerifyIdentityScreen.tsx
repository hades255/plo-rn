import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyIdentity'>;

export function VerifyIdentityScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('required');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.kyc.getStatus();
      setKycStatus(String(data?.kycStatus ?? 'required'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification status');
      setKycStatus('required');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isVerified = useMemo(() => kycStatus === 'verified', [kycStatus]);
  const isPending = useMemo(() => kycStatus === 'pending', [kycStatus]);

  const startHardKyc = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.kyc.create({ tier: 'hard' });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5B04" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isVerified ? 'Identity Verified' : isPending ? 'Verification Pending' : 'Verify Identity'}
        </Text>
        <Text style={styles.body}>
          {isVerified
            ? 'You are verified for full account access.'
            : isPending
              ? 'Your verification is being reviewed. Check back shortly.'
              : 'Complete verification to unlock full access and withdrawals.'}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {isVerified ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.disabled]}
            onPress={startHardKyc}
            disabled={submitting}>
            <Text style={styles.primaryBtnText}>
              {submitting ? 'Starting…' : 'Start Verification'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              if (!isPending) {
                navigation.navigate('SoftTierKyc');
              } else {
                refresh();
              }
            }}>
            <Text style={styles.secondaryBtnText}>
              {isPending ? 'Refresh Status' : 'Try Soft Verification'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  body: { color: '#4B5563', lineHeight: 20 },
  error: { color: '#B91C1C', marginTop: 4 },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#111827', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
