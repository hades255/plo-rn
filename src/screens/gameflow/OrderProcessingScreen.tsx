import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useGameFlow } from '../../store/GameFlowContext';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderProcessing'>;

export function OrderProcessingScreen({ navigation }: Props) {
  const { state, dispatch } = useGameFlow();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }
    if (!state.game || state.plays.length === 0) {
      if (state.game) {
        navigation.replace('GameHome', { game: state.game });
      } else {
        navigation.replace('Home');
      }
      return;
    }
    hasProcessedRef.current = true;

    const draws = state.settings.draws || 1;
    api.orders.draw
      .create({
        gameId: state.game.id,
        drawDate: new Date().toISOString().split('T')[0],
        lines: state.plays.map(p => ({
          numbers: p.numbers,
          bonus: p.bonus,
          quickPick: p.quickPick,
        })),
        draws,
        drawId: state.game.id,
        payment: {
          source: 'wallet',
          clientCartTotal:
            state.plays.length * Number(state.game.price_per_play ?? state.game.pricePerPlay ?? 2) * draws +
            Number(state.order?.serviceFee ?? 0),
        },
      })
      .then(result => {
        dispatch({ type: 'SET_LAST_ORDER', orderId: result.orderId });
        navigation.replace('OrderSuccess');
      })
      .catch(() => {
        hasProcessedRef.current = false;
        navigation.replace('OrderSummary');
      });
  }, [dispatch, navigation, state.game, state.order?.serviceFee, state.plays, state.settings.draws]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color="#1976D2" />
      <Text style={styles.text}>Processing your order...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', gap: 10 },
  text: { color: '#374151' },
});
