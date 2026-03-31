import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useGameFlow } from '../../store/GameFlowContext';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'PickNumbers'>;

function randomUniqueNumbers(count: number, max: number) {
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(1 + Math.floor(Math.random() * max));
  }
  return Array.from(picked).sort((a, b) => a - b);
}

export function PickNumbersScreen({navigation}: Props) {
  const { state, dispatch } = useGameFlow();
  const game = state.game;
  const [bonusOpen, setBonusOpen] = useState(false);

  const selected = state.draft.numbers;
  const pickCount = Number(game?.pickableCount ?? game?.mainPickCount ?? 5);
  const maxNum = 69;

  const canPickBonus = selected.length === pickCount;

  const ordLabel = useMemo(() => {
    const ord = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
    return ord[selected.length] || `${selected.length + 1}th`;
  }, [selected.length]);

  if (!game) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No selected game.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleNumber = (n: number) => {
    const exists = selected.includes(n);
    if (exists) {
      dispatch({ type: 'SET_DRAFT_NUMBERS', numbers: selected.filter(x => x !== n) });
      dispatch({ type: 'SET_DRAFT_BONUS', bonus: null });
      return;
    }
    if (selected.length >= pickCount) {
      return;
    }
    const next = [...selected, n].sort((a, b) => a - b);
    dispatch({ type: 'SET_DRAFT_NUMBERS', numbers: next });
    if (next.length === pickCount) {
      setBonusOpen(true);
    }
  };

  const addQuickPick = () => {
    const numbers = randomUniqueNumbers(pickCount, maxNum);
    const bonus = 1 + Math.floor(Math.random() * 26);
    dispatch({
      type: 'ADD_PLAY',
      play: { id: `play_${Date.now()}`, numbers, bonus, quickPick: true },
    });
    navigation.navigate('YourPlays');
  };

  const clearDraft = () => {
    dispatch({ type: 'RESET_DRAFT' });
  };

  const confirmBonus = (bonus: number) => {
    dispatch({ type: 'SET_DRAFT_BONUS', bonus });
    dispatch({
      type: 'ADD_PLAY',
      play: {
        id: `play_${Date.now()}`,
        numbers: state.draft.numbers,
        bonus,
        quickPick: false,
      },
    });
    setBonusOpen(false);
    navigation.navigate('YourPlays');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: game.bg_color || '#1876D0' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.heroBack}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>{game.name}</Text>
          <Text style={styles.heroJackpot}>{formatMoney(game.jackpot)}</Text>
          <Text style={styles.heroSub}>
            Pick {pickCount} numbers and 1 bonus
          </Text>
        </View>

        <View style={styles.selectedRow}>
          {Array.from({ length: pickCount }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.selectedDot,
                index < selected.length ? styles.selectedDotActive : null,
              ]}>
              <Text style={styles.selectedDotText}>
                {selected[index] ? String(selected[index]).padStart(2, '0') : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {Array.from({ length: maxNum }).map((_, i) => {
            const n = i + 1;
            const active = selected.includes(n);
            return (
              <TouchableOpacity
                key={n}
                style={[styles.numBtn, active && styles.numBtnActive]}
                onPress={() => toggleNumber(n)}>
                <Text style={[styles.numTxt, active && styles.numTxtActive]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={addQuickPick}>
            <Text style={styles.secondaryTxt}>Quick Pick</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={clearDraft}>
            <Text style={styles.secondaryTxt}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('YourPlays')}>
            <Text style={styles.secondaryTxt}>View cart ({state.plays.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, !canPickBonus && styles.disabledBtn]}
            disabled={!canPickBonus}
            onPress={() => setBonusOpen(true)}>
            <Text style={styles.primaryTxt}>
              {canPickBonus ? 'Pick Bonus' : `Pick ${ordLabel} Number`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {bonusOpen ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pick Bonus Number</Text>
            <View style={styles.modalGrid}>
              {Array.from({ length: 26 }).map((_, i) => {
                const n = i + 1;
                return (
                  <TouchableOpacity
                    key={n}
                    style={styles.modalNum}
                    onPress={() => confirmBonus(n)}>
                    <Text style={styles.modalNumText}>{n}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => setBonusOpen(false)}>
              <Text style={styles.link}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 140 },
  hero: { padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  heroBack: { color: '#fff', fontWeight: '700' },
  heroTitle: { color: '#fff', marginTop: 8, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroJackpot: { color: '#fff', textAlign: 'center', fontSize: 30, fontWeight: '800', marginTop: 4 },
  heroSub: { color: '#E5F2FF', textAlign: 'center', marginTop: 4 },
  selectedRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  selectedDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  selectedDotActive: { backgroundColor: '#2563EB' },
  selectedDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginTop: 12, justifyContent: 'center' },
  numBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  numBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  numTxt: { color: '#111827', fontWeight: '600' },
  numTxtActive: { color: '#fff' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 16, backgroundColor: '#FFFFFFF0', gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  secondaryTxt: { color: '#374151', fontWeight: '600' },
  primaryBtn: { flex: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  disabledBtn: { backgroundColor: '#9CA3AF' },
  modalBackdrop: { position: 'absolute', inset: 0, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 14, padding: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
  modalNum: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  modalNumText: { color: '#1D4ED8', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#111827', marginBottom: 8 },
  link: { color: '#FF5B04', fontWeight: '600', textAlign: 'center' },
});
