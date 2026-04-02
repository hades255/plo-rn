import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DrawGameNav,
  RootStackParamList,
  ScratchGameNav,
} from '../../types/navigation';
import { api } from '../../api/api';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type Game = {
  id: string;
  name?: string;
  type?: string;
  jackpot?: number | string;
  top_prize?: number | string;
};

function asDrawGame(game: Game): DrawGameNav {
  return game as DrawGameNav;
}

function asScratchGame(game: Game): ScratchGameNav {
  return game as ScratchGameNav;
}

export function HomeScreen({navigation}: Props) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.games
      .list()
      .then(data => {
        const safe = Array.isArray(data) ? (data as Game[]) : [];
        setGames(safe);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => games.slice(0, 4), [games]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome to Plotto</Text>
      <Text style={styles.subtitle}>Pick a game and start playing.</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => navigation.navigate('AllDrawGames')}>
          <Text style={styles.primaryActionText}>All Draw Games</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('AllScratchGames')}>
          <Text style={styles.secondaryActionText}>All Scratch Games</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileRow}>
        <TouchableOpacity style={styles.tertiaryAction} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.tertiaryActionText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tertiaryAction}
          onPress={() => navigation.navigate('Orders', { type: 'draw', tag: 0 })}>
          <Text style={styles.tertiaryActionText}>Orders</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Games</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF5B04" />
        </View>
      ) : (
        <FlatList
          data={featured}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                item.type === 'draw'
                  ? navigation.navigate('GameHome', { game: asDrawGame(item) })
                  : navigation.navigate('ScratchGameInfo', {
                      gameId: String(item.id),
                      game: asScratchGame(item),
                    })
              }>
              <Text style={styles.cardTitle}>{item.name ?? 'Untitled game'}</Text>
              <Text style={styles.cardMeta}>
                {item.type === 'draw'
                  ? `Jackpot ${formatMoney(item.jackpot)}`
                  : `Top Prize ${formatMoney(item.top_prize)}`}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No games available right now.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#6B7280',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#FF5B04',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#111827',
    fontWeight: '600',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tertiaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  tertiaryActionText: {
    color: '#374151',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  centered: {
    paddingTop: 20,
    alignItems: 'center',
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  cardTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  cardMeta: {
    marginTop: 4,
    color: '#4B5563',
  },
  empty: {
    color: '#6B7280',
  },
});
