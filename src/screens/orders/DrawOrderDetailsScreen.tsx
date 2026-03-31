import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'DrawOrderDetails'>;

export function DrawOrderDetailsScreen({ navigation, route }: Props) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigation.replace('Orders', { type: 'draw', tag: 0 });
      return;
    }
    setLoading(true);
    api.orders.draw
      .get(orderId)
      .then(data => setOrder(data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [navigation, orderId]);

  const tickets = useMemo(() => {
    const raw = (order?.tickets as Array<Record<string, unknown>>) ?? [];
    return raw;
  }, [order?.tickets]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1976D2" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Order not found.</Text>
      </View>
    );
  }

  const title = String((order.game as { name?: string })?.name ?? order.title ?? 'Draw Order');
  const orderRef = String(order.order_ref ?? order.id ?? '');
  const total = Number(order.total_amount ?? 0);
  const placedAt = formatDateTime(order.placedAt);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.ref}>{orderRef}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Ordered" value={placedAt || '—'} />
        <Row label="Total" value={formatMoney(total)} />
        <Row label="Tickets" value={String(tickets.length)} />
      </View>

      <Text style={styles.section}>Ticket Lines</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item, index) => String(item.ticket_ref ?? item.id ?? index)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const numbers = Array.isArray(item.numbers) ? item.numbers : [];
          return (
            <View style={styles.ticketCard}>
              <Text style={styles.ticketTitle}>Ticket {index + 1}</Text>
              <Text style={styles.ticketRef}>{String(item.ticket_ref ?? '')}</Text>
              <Text style={styles.numbers}>{numbers.flatMap((n: unknown) => (typeof n === 'number' ? [n] : [])).join(' - ') || '—'}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#64748B' },
  header: { padding: 14, backgroundColor: '#1976D2' },
  back: { color: '#fff', fontWeight: '700' },
  headerTitle: { marginTop: 8, color: '#fff', fontSize: 20, fontWeight: '700' },
  ref: { marginTop: 2, color: '#DBEAFE' },
  card: { margin: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: '#64748B' },
  rowValue: { color: '#334155', fontWeight: '600' },
  section: { marginHorizontal: 12, marginTop: 2, marginBottom: 4, color: '#334155', fontWeight: '700' },
  list: { paddingHorizontal: 12, paddingBottom: 16, gap: 10 },
  ticketCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  ticketTitle: { color: '#334155', fontWeight: '700' },
  ticketRef: { marginTop: 2, color: '#64748B', fontSize: 12 },
  numbers: { marginTop: 8, color: '#1E293B' },
});
