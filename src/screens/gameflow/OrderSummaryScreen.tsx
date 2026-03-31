import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useGameFlow } from '../../store/GameFlowContext';
import { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSummary'>;

export function OrderSummaryScreen({ navigation }: Props) {
  const { state, dispatch } = useGameFlow();
  const game = state.game;
  const [quote, setQuote] = useState<{ subtotal: number; serviceFee: number; total: number } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const draws = state.settings.draws || 1;
  const subtotal = useMemo(() => {
    if (quote) return quote.subtotal;
    const price = Number(game?.price_per_play ?? game?.pricePerPlay ?? 2);
    return state.plays.length * price * draws;
  }, [draws, game?.pricePerPlay, game?.price_per_play, quote, state.plays.length]);
  const total = quote?.total ?? subtotal;

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
      .then(data => {
        setQuote(data);
        dispatch({ type: 'SET_SERVICE_FEE', serviceFee: data?.serviceFee ?? 0 });
      })
      .catch(() => setQuote(null));
  }, [dispatch, game, state.plays, state.settings.draws]);

  if (!game) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No selected game.</Text>
      </View>
    );
  }

  const balanceLow = balance != null && balance < total;

  const placeOrder = () => {
    if (submitting || balanceLow) {
      return;
    }
    setSubmitting(true);
    navigation.replace('OrderProcessing');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Summary</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <Row label="Game" value={game.name ?? 'Draw Game'} />
          <Row label="Number of plays" value={String(state.plays.length)} />
          <Row label="Draws per play" value={String(draws)} />
          <Row label="Price per play" value={formatMoney(game.price_per_play ?? game.pricePerPlay)} />
          {quote ? <Row label="Service fee" value={formatMoney(quote.serviceFee)} /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Drawing Information</Text>
          <Text style={styles.normal}>{formatDateTime(game.draw_time)}</Text>
          <Text style={styles.subtle}>Results available after draw</Text>
        </View>

        {balanceLow ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>Balance too low</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddFunds')}>
              <Text style={styles.warningLink}>Add funds</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, (submitting || balanceLow) && styles.disabled]}
          disabled={submitting || balanceLow}
          onPress={placeOrder}>
          <Text style={styles.primaryTxt}>
            {submitting ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
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
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  back: { color: '#111827', fontWeight: '700' },
  title: { marginTop: 8, color: '#111827', fontSize: 18, fontWeight: '700' },
  body: { padding: 12, gap: 10, paddingBottom: 140 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#FAFAFA' },
  cardTitle: { color: '#111827', fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: '#4B5563' },
  rowValue: { color: '#111827', fontWeight: '600' },
  normal: { color: '#111827' },
  subtle: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  warning: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  warningText: { color: '#92400E' },
  warningLink: { color: '#B45309', fontWeight: '700', textDecorationLine: 'underline' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFFF0', padding: 12, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#4B5563', fontSize: 16 },
  totalValue: { color: '#111827', fontWeight: '700', fontSize: 24 },
  primaryBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#111827' },
});
