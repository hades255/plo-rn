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
import { formatDateTime, formatMoney, formatRemaining } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AllDrawGames'>;
type DrawGame = {
  id: string;
  slug?: string;
  name?: string;
  state?: string;
  draw_time?: string;
  cutoff_time?: string;
  jackpot?: number | string;
  bg_color?: string;
};

export function AllDrawGamesScreen({navigation}: Props) {
  const [games, setGames] = useState<DrawGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.games
      .list('draw')
      .then(data => {
        const safe = Array.isArray(data) ? (data as DrawGame[]) : [];
        setGames(safe.filter(g => Boolean(g?.id)));
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const rows = games;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Draw Games</Text>
        <View style={styles.rightSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1876D0" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({item}) => {
            const cardColor = item.bg_color || '#1876D0';
            return (
              <TouchableOpacity
                style={[styles.card, {backgroundColor: cardColor}]}
                onPress={() => navigation.navigate('GameHome', { game: item })}>
                <View style={styles.left}>
                  <Text style={styles.name}>{item.name ?? 'Draw Game'}</Text>
                  <Text style={styles.meta}>{formatDateTime(item.draw_time)}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.jackpotLabel}>Jackpot</Text>
                  <Text style={styles.jackpot}>{formatMoney(item.jackpot)}</Text>
                  <Text style={styles.countdown}>{formatRemaining(item.cutoff_time)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No draw games available right now.</Text>
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
    backgroundColor: '#1876D0',
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
  left: { flex: 1, paddingRight: 8 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { color: '#E5F2FF', marginTop: 3, fontSize: 12 },
  right: { alignItems: 'flex-end' },
  jackpotLabel: { color: '#E5F2FF', fontSize: 11 },
  jackpot: { color: '#fff', fontWeight: '800', fontSize: 18 },
  countdown: { color: '#fff', marginTop: 4, fontSize: 12 },
  empty: { color: '#6B7280', paddingHorizontal: 16, paddingTop: 12 },
});
