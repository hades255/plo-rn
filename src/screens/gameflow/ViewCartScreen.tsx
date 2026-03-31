import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useGameFlow } from '../../store/GameFlowContext';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ViewCart'>;

export function ViewCartScreen({ navigation }: Props) {
  const { state, dispatch } = useGameFlow();
  const game = state.game;
  const [quote, setQuote] = useState<{ subtotal: number; serviceFee: number; total: number } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    api.wallet
      .getBalance()
      .then(data => setBalance(Number(data?.payable ?? data?.balance ?? 0)))
      .catch(() => setBalance(0));
  }, []);

  useEffect(() => {
    if (!game || state.plays.length === 0) {
      return;
    }
    api.gameflow
      .quote({
        gameId: game.id,
        lines: state.plays.map(p => ({ numbers: p.numbers, bonus: p.bonus })),
        draws: state.settings.draws || 1,
      })
      .then(setQuote)
      .catch(() => setQuote(null));
  }, [game, state.plays, state.settings.draws]);

  if (!game) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No selected game.</Text>
      </View>
    );
  }

  if (state.plays.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Cart is empty.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PickNumbers')}>
          <Text style={styles.link}>Pick numbers</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const draws = state.settings.draws || 1;
  const calculatedTotal = state.plays.length * Number(game.price_per_play ?? game.pricePerPlay ?? 2) * draws;
  const total = quote?.total ?? calculatedTotal;
  const balanceLow = balance != null && balance < total;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>View Cart</Text>
      </View>

      {balanceLow ? (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Balance too low</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddFunds')}>
            <Text style={styles.warningLink}>Add funds</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={state.plays}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Play #{index + 1}</Text>
            <Text style={styles.numbers}>{item.numbers.join(' - ')}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => dispatch({ type: 'REMOVE_PLAY', id: item.id })}>
              <Text style={styles.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <View style={styles.totals}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('OrderSummary')}>
          <Text style={styles.primaryTxt}>Continue to Order Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  back: { color: '#111827', fontWeight: '700' },
  title: { marginTop: 8, color: '#111827', fontSize: 18, fontWeight: '700' },
  warning: { margin: 12, backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  warningText: { color: '#92400E' },
  warningLink: { color: '#B45309', fontWeight: '700', textDecorationLine: 'underline' },
  list: { padding: 12, gap: 10, paddingBottom: 140 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFB' },
  cardTitle: { color: '#111827', fontWeight: '700' },
  numbers: { color: '#1D4ED8', marginTop: 4, fontWeight: '700' },
  removeBtn: { marginTop: 8, alignSelf: 'flex-start' },
  removeTxt: { color: '#DC2626', fontWeight: '600' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFFF0', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  totals: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6 },
  totalLabel: { color: '#4B5563' },
  totalValue: { color: '#111827', fontWeight: '700', fontSize: 22 },
  primaryBtn: { borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#111827', marginBottom: 8 },
  link: { color: '#FF5B04', fontWeight: '600' },
});
