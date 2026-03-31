import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useScratchCart } from '../../store/ScratchCartContext';
import { RootStackParamList, ScratchGameNav } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ScratchGameInfo'>;

export function ScratchGameInfoScreen({navigation, route}: Props) {
  const { state, dispatch } = useScratchCart();
  const [game, setGame] = useState<ScratchGameNav | null>(route.params?.game ?? null);
  const [loading, setLoading] = useState(!route.params?.game);

  const gameId = route.params?.gameId;

  useEffect(() => {
    if (game || !gameId) {
      return;
    }
    setLoading(true);
    api.games
      .getScratchById(gameId)
      .then(data => setGame((data as ScratchGameNav) ?? null))
      .catch(() => setGame(null))
      .finally(() => setLoading(false));
  }, [game, gameId]);

  const quantity = useMemo(() => {
    return state.items.find(i => String(i.gameId) === String(game?.id))?.quantity ?? 0;
  }, [state.items, game?.id]);

  const disabled =
    !game || game.scratchable_areas == null || Number(game.available_tickets ?? 0) <= 0;

  const handleAddToCart = () => {
    if (!game || disabled) {
      return;
    }
    dispatch({
      type: 'ADD_ITEM',
      gameId: String(game.id),
      title: game.name ?? 'Scratch Game',
      price: Number(game.price ?? 0),
      image: game.image_url,
      topPrize: Number(game.top_prize ?? 0),
    });
    navigation.navigate('ScratchOrderCart');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5B04" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Game not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageWrap}>
          {game.image_url ? (
            <Image source={{ uri: game.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>Scratch Game</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{game.name ?? 'Scratch Game'}</Text>
        <Text style={styles.subtitle}>
          Play this scratch game and reveal your chance to win instantly.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Price</Text>
            <Text style={styles.rowValue}>{formatMoney(game.price)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Top Prize</Text>
            <Text style={styles.rowValue}>{formatMoney(game.top_prize)}</Text>
          </View>
          <View style={styles.rowNoBorder}>
            <Text style={styles.rowLabel}>Available</Text>
            <Text style={styles.rowValue}>
              {Number(game.available_tickets ?? 0) > 0 ? 'In stock' : 'Sold out'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cta, disabled && styles.ctaDisabled]}
          disabled={disabled}
          onPress={handleAddToCart}>
          <Text style={styles.ctaText}>
            {disabled
              ? 'Unavailable'
              : quantity > 0
              ? `Add Another & View Cart (${quantity + 1})`
              : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  back: { color: '#111827', fontWeight: '700' },
  content: { padding: 16 },
  imageWrap: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: { width: '100%', height: '100%' },
  noImage: {
    flex: 1,
    backgroundColor: '#FF8A4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: { color: '#fff', fontWeight: '700' },
  title: { marginTop: 14, fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 6, color: '#4A5565' },
  statsCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: { color: '#4A5565' },
  rowValue: { color: '#111827', fontWeight: '700' },
  cta: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: '#fff', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  emptyTitle: { color: '#111827', fontWeight: '700', marginBottom: 8 },
  link: { color: '#FF5B04', fontWeight: '600' },
});
