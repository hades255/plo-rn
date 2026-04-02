import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FinancialCenter'>;

const TABS = ['Payment Methods', 'Transaction History', 'Taxes'] as const;

const PAGE = 20;

export function FinancialCenterScreen({ navigation }: Props) {
  const [tab, setTab] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [methods, setMethods] = useState<Array<Record<string, unknown>>>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [tx, setTx] = useState<Array<Record<string, unknown>>>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    api.kyc
      .getStatus()
      .then(d => setKycStatus(String(d?.kycStatus ?? 'required')))
      .catch(() => setKycStatus('required'));
  }, []);

  const loadMethods = useCallback(async () => {
    setMethodsLoading(true);
    try {
      const data = await api.profile.paymentMethods.list();
      setMethods(Array.isArray(data?.methods) ? data.methods : []);
    } catch {
      setMethods([]);
    } finally {
      setMethodsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 0) {
      loadMethods();
    }
  }, [tab, loadMethods]);

  useEffect(() => {
    if (tab !== 1) {
      return;
    }
    let active = true;
    setTxLoading(true);
    api.wallet
      .getTransactions({ skip: 0, limit: PAGE })
      .then(data => {
        const list = Array.isArray(data)
          ? data
          : (data as { transactions?: unknown[]; data?: unknown[] })?.transactions ??
            (data as { data?: unknown[] })?.data ??
            [];
        const rows = (list ?? []) as Array<Record<string, unknown>>;
        if (active) {
          setTx(rows);
          setHasMore(rows.length >= PAGE);
        }
      })
      .catch(() => {
        if (active) {
          setTx([]);
        }
      })
      .finally(() => {
        if (active) {
          setTxLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [tab]);

  const loadMoreTx = async () => {
    if (txLoading || !hasMore) {
      return;
    }
    setTxLoading(true);
    try {
      const data = await api.wallet.getTransactions({ skip: tx.length, limit: PAGE });
      const list = Array.isArray(data)
        ? data
        : (data as { transactions?: unknown[]; data?: unknown[] })?.transactions ??
          (data as { data?: unknown[] })?.data ??
          [];
      const rows = (list ?? []) as Array<Record<string, unknown>>;
      setTx(prev => [...prev, ...rows]);
      setHasMore(rows.length >= PAGE);
    } catch {
      setHasMore(false);
    } finally {
      setTxLoading(false);
    }
  };

  const removeMethod = async (id: string) => {
    try {
      await api.profile.paymentMethods.remove(id);
      await loadMethods();
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not remove');
    }
  };

  const kycVerified = kycStatus === 'verified';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Financial Center</Text>
      <Text style={styles.sub}>
        A snapshot of your funds across Plotto and where to view tax documents.
      </Text>

      {!kycVerified && kycStatus ? (
        <TouchableOpacity
          style={styles.kycBanner}
          onPress={() => navigation.navigate('VerifyIdentity')}
          activeOpacity={0.9}>
          <Text style={styles.kycTitle}>
            {kycStatus === 'pending'
              ? 'Identity verification in progress'
              : 'Verify your identity to withdraw'}
          </Text>
          <Text style={styles.kycSub}>
            {kycStatus === 'pending'
              ? 'We are reviewing your documents.'
              : 'Required before withdrawals.'}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.tabRow}>
        {TABS.map((label, i) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, tab === i && styles.tabActive]}
            onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Payment Methods</Text>
          <Text style={styles.panelSub}>Manage stored payment methods.</Text>
          {methodsLoading ? (
            <ActivityIndicator style={styles.loader} color="#FF5B04" />
          ) : methods.length === 0 ? (
            <Text style={styles.empty}>No payment methods on file.</Text>
          ) : (
            methods.map((m, index) => {
              const id = String(m.id ?? index);
              return (
                <View key={id} style={styles.methodRow}>
                  <View style={styles.methodBody}>
                    <Text style={styles.methodName}>{String(m.name ?? 'Card')}</Text>
                    <Text style={styles.methodMeta}>
                      {String(m.brand ?? '')} {m.last4 ? `••${m.last4}` : ''}
                    </Text>
                  </View>
                  {m.id != null ? (
                    <TouchableOpacity onPress={() => removeMethod(String(m.id))}>
                      <Text style={styles.remove}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      ) : null}

      {tab === 1 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Transaction History</Text>
          <Text style={styles.panelSub}>Deposits, withdrawals, and purchases.</Text>
          {txLoading && tx.length === 0 ? (
            <ActivityIndicator style={styles.loader} color="#FF5B04" />
          ) : tx.length === 0 ? (
            <Text style={styles.empty}>No transactions yet.</Text>
          ) : (
            tx.map((item, i) => (
              <View
                key={String(item.id ?? item.referenceId ?? i)}
                style={styles.txRow}>
                <Text style={styles.txDesc}>
                  {String(item.description ?? item.transactionType ?? 'Transaction')}
                </Text>
                <Text style={styles.txAmt}>{formatMoney(item.amount ?? item.value ?? 0)}</Text>
                <Text style={styles.txDate}>{formatDateTime(item.createdAt ?? item.date)}</Text>
              </View>
            ))
          )}
          {hasMore && tx.length > 0 ? (
            <TouchableOpacity
              style={styles.moreBtn}
              disabled={txLoading}
              onPress={loadMoreTx}>
              <Text style={styles.moreText}>{txLoading ? 'Loading…' : 'Load more'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {tab === 2 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Taxes</Text>
          <Text style={styles.panelSub}>
            Tax documents will appear here when available. Contact support if you need help.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { color: '#4A5565', marginTop: 4, marginBottom: 12 },
  kycBanner: {
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  kycTitle: { color: '#92400E', fontWeight: '700' },
  kycSub: { color: '#B45309', fontSize: 12, marginTop: 4 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: { borderColor: '#FF5B04', backgroundColor: '#FFF7ED' },
  tabText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  tabTextActive: { color: '#C2410C' },
  panel: { gap: 8 },
  panelTitle: { fontWeight: '700', color: '#111827' },
  panelSub: { color: '#6B7280', fontSize: 13 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
  },
  methodBody: { flex: 1 },
  methodName: { fontWeight: '600', color: '#111827' },
  methodMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  remove: { color: '#DC2626', fontWeight: '600' },
  txRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 10,
    gap: 2,
  },
  txDesc: { color: '#111827', fontWeight: '600' },
  txAmt: { color: '#059669', fontWeight: '700' },
  txDate: { color: '#9CA3AF', fontSize: 12 },
  empty: { color: '#9CA3AF', marginVertical: 8 },
  loader: { marginVertical: 16 },
  moreBtn: { alignSelf: 'center', marginTop: 8, padding: 8 },
  moreText: { color: '#FF5B04', fontWeight: '700' },
});
