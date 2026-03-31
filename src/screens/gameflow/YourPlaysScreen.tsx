import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useGameFlow } from '../../store/GameFlowContext';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'YourPlays'>;

export function YourPlaysScreen({ navigation }: Props) {
  const { state, dispatch } = useGameFlow();
  const game = state.game;
  const draws = state.settings.draws || 1;
  const total = useMemo(() => {
    const price = Number(game?.price_per_play ?? game?.pricePerPlay ?? 2);
    return state.plays.length * price * draws;
  }, [draws, game?.pricePerPlay, game?.price_per_play, state.plays.length]);

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
        <Text style={styles.empty}>No plays yet.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PickNumbers')}>
          <Text style={styles.link}>Pick numbers</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your plays ({state.plays.length})</Text>
      </View>

      <FlatList
        data={state.plays}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Play #{index + 1}</Text>
            <Text style={styles.numbers}>{item.numbers.join(' - ')}</Text>
            <Text style={styles.meta}>
              Bonus: {item.bonus ?? '—'} • {item.quickPick ? 'Quick Pick' : 'Manual'}
            </Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => dispatch({ type: 'REMOVE_PLAY', id: item.id })}>
              <Text style={styles.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('PickNumbers')}>
          <Text style={styles.secondaryTxt}>+ Add another play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ViewCart')}>
          <Text style={styles.primaryTxt}>
            {state.plays.length} - View Cart - {formatMoney(total)}
          </Text>
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
  list: { padding: 12, gap: 10, paddingBottom: 140 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFB' },
  cardTitle: { color: '#111827', fontWeight: '700' },
  numbers: { marginTop: 4, color: '#1D4ED8', fontWeight: '700' },
  meta: { marginTop: 4, color: '#4B5563', fontSize: 12 },
  removeBtn: { marginTop: 8, alignSelf: 'flex-start' },
  removeTxt: { color: '#DC2626', fontWeight: '600' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFFF0', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  secondaryBtn: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' },
  secondaryTxt: { color: '#374151', fontWeight: '600' },
  primaryBtn: { borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#111827', marginBottom: 8 },
  link: { color: '#FF5B04', fontWeight: '600' },
});
