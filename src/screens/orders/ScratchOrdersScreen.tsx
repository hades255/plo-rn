import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../api/api';
import { formatMoney } from '../../utils/format';

type ScratchTicket = {
  id?: string;
  ticketRef?: string;
  ticketCode?: string;
  title?: string;
  status?: string;
  orderedAt?: string;
  scratchedAt?: string;
  total?: number;
  winnings?: number;
  topPrize?: number;
};

type Props = {
  navigation: {
    navigate: (name: string, params?: unknown) => void;
  };
  route?: { params?: { tag?: 0 | 1 | 2 } };
  embed?: boolean;
  onChangeTag?: (value: 0 | 1 | 2) => void;
};

export function ScratchOrdersScreen({ navigation, route, embed, onChangeTag }: Props) {
  const [tickets, setTickets] = useState<ScratchTicket[]>([]);
  const [tag, setTag] = useState<0 | 1 | 2>(route?.params?.tag ?? 0);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => (tag === 0 ? 'Unscratched' : tag === 1 ? 'Scratched' : 'Wins'), [tag]);

  useEffect(() => {
    setLoading(true);
    api.orders.scratch
      .listScratchable(tag, { limit: 50, offset: 0 })
      .then(data => setTickets((data?.tickets as ScratchTicket[]) ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [tag]);

  const setCurrentTag = (value: 0 | 1 | 2) => {
    setTag(value);
    onChangeTag?.(value);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {(['Unscratched', 'Scratched', 'Wins'] as const).map((label, idx) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, tag === idx && styles.tabActive]}
            onPress={() => setCurrentTag(idx as 0 | 1 | 2)}>
            <Text style={[styles.tabText, tag === idx && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.caption}>{title} Tickets</Text>
      {loading ? (
        <Text style={styles.meta}>Loading…</Text>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item, index) => String(item.ticketRef ?? item.id ?? index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isWin = Number(item.winnings ?? 0) > 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('ScratchOrderDetails', {
                    ticketRef: String(item.ticketRef ?? item.id),
                  })
                }>
                <Text style={styles.cardTitle}>{item.title ?? 'Scratch Ticket'}</Text>
                <Text style={styles.cardSub}>{item.ticketCode ?? item.ticketRef ?? ''}</Text>
                <Text style={styles.cardMeta}>Total: {formatMoney(item.total)}</Text>
                <Text style={[styles.status, isWin && styles.statusWin]}>
                  {isWin ? `Winner • ${formatMoney(item.winnings)}` : item.status ?? 'Processing'}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.meta}>No tickets found.</Text>}
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
  tabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#4A5565', fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#FF5B04' },
  caption: { marginTop: 8, color: '#364153', fontWeight: '700' },
  list: { paddingTop: 10, gap: 10, paddingBottom: 16 },
  card: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  cardTitle: { color: '#1E293B', fontWeight: '700' },
  cardSub: { color: '#64748B', marginTop: 2, fontSize: 12 },
  cardMeta: { color: '#334155', marginTop: 6 },
  status: { marginTop: 6, color: '#4A5565', fontWeight: '600' },
  statusWin: { color: '#00AE81' },
  meta: { paddingTop: 14, color: '#6A7282' },
  backBtn: { marginTop: 8, alignSelf: 'flex-start' },
  backTxt: { color: '#1976D2', fontWeight: '600' },
});
