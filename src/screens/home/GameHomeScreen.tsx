import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useGameFlow } from '../../store/GameFlowContext';
import { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'GameHome'>;

function randomUniqueNumbers(count: number, max: number) {
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(1 + Math.floor(Math.random() * max));
  }
  return Array.from(picked).sort((a, b) => a - b);
}

export function GameHomeScreen({navigation, route}: Props) {
  const { state, dispatch } = useGameFlow();
  const game = route.params?.game;
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    if (game) {
      dispatch({ type: 'SET_GAME', game });
    }
  }, [dispatch, game]);


  const pricePerPlay = Number(game?.price_per_play ?? game?.pricePerPlay ?? 2);
  const pickCount = Number(game?.pickableCount ?? game?.mainPickCount ?? 5);
  const drawBg = game?.bg_color || '#1876D0';
  const actionBg = game?.draw_color || '#105CA7';

  useEffect(() => {
    api.wallet
      .getBalance()
      .then(data => {
        const pay = Number(data?.payable ?? data?.balance ?? 0);
        setBalance(Number.isFinite(pay) ? pay : 0);
      })
      .catch(() => setBalance(0));
  }, []);

  const quickPickOptions = [1, 3, 5, 10, 25];

  const canAfford = useMemo(() => {
    if (balance == null) {
      return true;
    }
    return balance >= pricePerPlay;
  }, [balance, pricePerPlay]);

  const addQuickPicks = (count: number) => {
    const max = 69;
    const generated = Array.from({ length: count }, () => randomUniqueNumbers(pickCount, max));
    generated.forEach(numbers =>
      dispatch({
        type: 'ADD_PLAY',
        play: {
          id: `play_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          numbers,
          bonus: 1 + Math.floor(Math.random() * 26),
          quickPick: true,
        },
      }),
    );
    navigation.navigate('YourPlays');
  };

  if (!game) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Game not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.hero, {backgroundColor: drawBg}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{game.name ?? 'Draw Game'}</Text>
        <Text style={styles.heroMeta}>Estimated Jackpot</Text>
        <Text style={styles.jackpot}>{formatMoney(game.jackpot)}</Text>
        <Text style={styles.heroMeta}>{formatDateTime(game.draw_time)}</Text>
      </View>

      {!canAfford ? (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Balance too low for a ticket.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddFunds')}>
            <Text style={styles.warningLink}>Add funds</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.ownPickBtn}
        onPress={() => navigation.navigate('PickNumbers')}>
        <Text style={styles.ownPickText}>Pick your own numbers</Text>
      </TouchableOpacity>

      {state.plays.length > 0 ? (
        <TouchableOpacity
          style={[styles.viewPlaysBtn, {backgroundColor: actionBg}]}
          onPress={() => navigation.navigate('YourPlays')}>
          <Text style={styles.viewPlaysText}>View Your Plays ({state.plays.length})</Text>
        </TouchableOpacity>
      ) : null}

      <View style={[styles.quickPickWrap, {backgroundColor: actionBg}]}>
        <Text style={styles.quickPickTitle}>Popular Quick Picks</Text>
        <View style={styles.quickPickGrid}>
          {quickPickOptions.map(count => (
            <TouchableOpacity
              key={count}
              style={styles.quickPickBtn}
              onPress={() => addQuickPicks(count)}>
              <Text style={styles.quickPickText}>${count * pricePerPlay}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Price per play</Text>
        <Text style={styles.priceValue}>${pricePerPlay.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 24 },
  hero: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  back: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroMeta: { color: '#EAF2FF', textAlign: 'center', marginTop: 4 },
  jackpot: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 34, marginTop: 2 },
  warning: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warningText: { color: '#92400E' },
  warningLink: { color: '#B45309', textDecorationLine: 'underline', fontWeight: '700' },
  ownPickBtn: {
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ownPickText: { color: '#111827', fontWeight: '600' },
  viewPlaysBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewPlaysText: { color: '#fff', fontWeight: '700' },
  quickPickWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
  },
  quickPickTitle: { color: '#fff', textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  quickPickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickPickBtn: {
    minWidth: 84,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  quickPickText: { color: '#111827', fontWeight: '600' },
  priceRow: {
    marginHorizontal: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: { color: '#4B5563' },
  priceValue: { color: '#111827', fontWeight: '700' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  fallbackTitle: { color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  link: { color: '#FF5B04', fontWeight: '600' },
});
