import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SpendingLimits'>;

const TYPES = ['daily', 'weekly', 'monthly'] as const;
type LimitType = (typeof TYPES)[number];

export function SpendingLimitsScreen({}: Props) {
  const [limits, setLimits] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<LimitType>('daily');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.profile.responsibleGaming.limits
      .get()
      .then(data => setLimits(data))
      .catch(() =>
        setLimits({
          selfImposed: { daily: null, weekly: null, monthly: null },
          ny: { daily: 1000, weekly: 2500, dailySpent: 0 },
        }),
      );
  }, []);

  const nyDaily = Number((limits?.ny as Record<string, unknown> | undefined)?.daily ?? 1000);
  const nySpent = Number((limits?.ny as Record<string, unknown> | undefined)?.dailySpent ?? 0);
  const dailyPct = useMemo(() => Math.min(100, (nySpent / Math.max(1, nyDaily)) * 100), [nyDaily, nySpent]);

  const openAdd = (type: LimitType) => {
    setSelectedType(type);
    setAmount('');
    setShowModal(true);
  };

  const saveLimit = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      return;
    }
    setSaving(true);
    try {
      const data = await api.profile.responsibleGaming.limits.add({ type: selectedType, amount: n });
      setLimits(data);
      setShowModal(false);
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not save limit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Lottery Spending Limits</Text>
      <Text style={styles.sub}>
        Set boundaries for how much you can spend. Limits help keep play under control.
      </Text>

      {TYPES.map(type => {
        const self = ((limits?.selfImposed as Record<string, unknown> | undefined) ?? {})[type];
        return (
          <View key={type} style={styles.limitRow}>
            <View>
              <Text style={styles.limitTitle}>{type[0].toUpperCase() + type.slice(1)} Limit</Text>
              {self != null ? <Text style={styles.limitValue}>{formatMoney(self)}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => openAdd(type)}>
              <Text style={styles.action}>{self != null ? 'Change' : 'Add Limit'}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.nyCard}>
        <Text style={styles.nyTitle}>New York Daily Spending</Text>
        <Text style={styles.nyAmount}>
          {formatMoney(nySpent)} / {formatMoney(nyDaily)}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${dailyPct}%` }]} />
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set {selectedType} limit</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={styles.input}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabled]}
                disabled={saving}
                onPress={saveLimit}>
                <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#4B5563' },
  limitRow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitTitle: { fontWeight: '700', color: '#111827' },
  limitValue: { color: '#4B5563', marginTop: 4 },
  action: { color: '#2563EB', fontWeight: '600' },
  nyCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  nyTitle: { color: '#111827', fontWeight: '700' },
  nyAmount: { color: '#4B5563' },
  track: { height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#2563EB' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  modalTitle: { color: '#111827', fontWeight: '700', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 2 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  cancelText: { color: '#111827', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: '#1876D0',
  },
  saveText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
