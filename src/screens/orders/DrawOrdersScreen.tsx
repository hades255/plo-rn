import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../api/api';
import { formatMoney, formatRemaining } from '../../utils/format';

type DrawOrder = {
  id?: string;
  order_ref?: string;
  title?: string;
  total_amount?: number;
  cutoffTime?: string;
  drawTime?: string;
  winnings?: number;
};

type Props = {
  navigation: {
    navigate: (name: string, params?: unknown) => void;
  };
  route?: { params?: { tag?: 0 | 1 | 2 } };
  embed?: boolean;
  onChangeTag?: (value: 0 | 1 | 2) => void;
};

export function DrawOrdersScreen({ navigation, route, embed, onChangeTag }: Props) {
  const [orders, setOrders] = useState<DrawOrder[]>([]);
  const [tag, setTag] = useState<0 | 1 | 2>(route?.params?.tag ?? 0);
  const [loading, setLoading] = useState(true);

  const filter = useMemo(() => (tag === 0 ? 'active' : tag === 1 ? 'past' : 'wins'), [tag]);

  useEffect(() => {
    setLoading(true);
    api.orders.draw
      .list(filter)
      .then(data => setOrders(Array.isArray(data) ? (data as DrawOrder[]) : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const setCurrentTag = (value: 0 | 1 | 2) => {
    setTag(value);
    onChangeTag?.(value);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {(['Active', 'Past', 'Wins'] as const).map((label, idx) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, tag === idx && styles.tabActive]}
            onPress={() => setCurrentTag(idx as 0 | 1 | 2)}>
            <Text style={[styles.tabText, tag === idx && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.meta}>Loading…</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => String(item.id ?? item.order_ref ?? index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const duration = item.cutoffTime ?? item.drawTime;
            const status =
              tag === 0
                ? formatRemaining(duration)
                : Number(item.winnings ?? 0) > 0
                ? `Winner • ${formatMoney(item.winnings)}`
                : 'Not a winner';
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('DrawOrderDetails', {
                    orderId: String(item.id ?? item.order_ref),
                  })
                }>
                <Text style={styles.cardTitle}>{item.title ?? 'Draw Order'}</Text>
                <Text style={styles.cardSub}>{item.order_ref ?? item.id ?? ''}</Text>
                <Text style={styles.cardMeta}>Total: {formatMoney(item.total_amount)}</Text>
                <Text style={styles.status}>{status}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.meta}>No orders found.</Text>}
        />
      )}

      {!embed ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.backTxt}>Back to all orders</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#4A5565', fontWeight: '600' },
  tabTextActive: { color: '#1976D2' },
  list: { paddingTop: 10, gap: 10, paddingBottom: 16 },
  card: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  cardTitle: { color: '#1E293B', fontWeight: '700' },
  cardSub: { color: '#64748B', marginTop: 2, fontSize: 12 },
  cardMeta: { color: '#334155', marginTop: 6 },
  status: { marginTop: 6, color: '#0EA5E9', fontWeight: '600' },
  meta: { paddingTop: 14, color: '#6A7282' },
  backBtn: { marginTop: 8, alignSelf: 'flex-start' },
  backTxt: { color: '#1976D2', fontWeight: '600' },
});
