import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { api } from '../../api/api';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AllScratchGames'>;
type ScratchGame = {
  id: string;
  name?: string;
  top_prize?: number | string;
  price?: number | string;
  scratchable_areas?: unknown;
  available_tickets?: number;
};

export function AllScratchGamesScreen({navigation}: Props) {
  const [games, setGames] = useState<ScratchGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.games
      .list('scratch')
      .then(data => {
        const safe = Array.isArray(data) ? (data as ScratchGame[]) : [];
        setGames(safe.filter(g => Boolean(g?.id)));
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Scratch Games</Text>
        <View style={styles.rightSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF5B04" />
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({item, index}) => {
            const disabled =
              item.scratchable_areas == null || Number(item.available_tickets ?? 0) <= 0;
            const cardColor =
              index % 3 === 0 ? '#FF5B04' : index % 3 === 1 ? '#FE7211' : '#FF971E';
            return (
              <TouchableOpacity
                style={[styles.card, {backgroundColor: cardColor}, disabled && styles.disabled]}
                disabled={disabled}
                onPress={() =>
                  navigation.navigate('ScratchGameInfo', {
                    gameId: String(item.id),
                    game: item,
                  })
                }>
                <View style={styles.left}>
                  <Text style={styles.name}>{item.name ?? 'Scratch Game'}</Text>
                  <Text style={styles.meta}>Top Prize {formatMoney(item.top_prize)}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.price}>{formatMoney(item.price)}</Text>
                  <Text style={styles.priceHint}>per ticket</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No scratch games available right now.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5B04',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  back: { color: '#fff', fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  rightSpacer: { width: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 14, gap: 10 },
  card: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabled: { opacity: 0.55 },
  left: { flex: 1, paddingRight: 8 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { color: '#FFECE3', marginTop: 3, fontSize: 12 },
  right: { alignItems: 'flex-end' },
  price: { color: '#fff', fontWeight: '800', fontSize: 18 },
  priceHint: { color: '#FFECE3', fontSize: 11 },
  empty: { color: '#6B7280', paddingHorizontal: 16, paddingTop: 12 },
});
