import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGameFlow } from '../../store/GameFlowContext';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen({ navigation }: Props) {
  const { dispatch } = useGameFlow();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleViewOrder = () => {
    dispatch({ type: 'CLEAR_ALL' });
    navigation.replace('Orders');
  };

  const handleDone = () => {
    dispatch({ type: 'CLEAR_ALL' });
    navigation.replace('Home');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>Confirming your order...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.checkWrap}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.title}>Order successful!</Text>
      <Text style={styles.subtitle}>Your order has been purchased.</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleViewOrder}>
          <Text style={styles.primaryTxt}>View Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleDone}>
          <Text style={styles.secondaryTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF66',
    borderTopColor: '#fff',
  },
  loadingText: { color: '#fff', fontSize: 16 },
  screen: {
    flex: 1,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  checkWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 42, color: '#059669', fontWeight: '700' },
  title: { marginTop: 16, color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, color: '#D1FAE5', fontSize: 16, textAlign: 'center' },
  actions: { marginTop: 20, width: '100%', gap: 10 },
  primaryBtn: { height: 52, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#059669', fontWeight: '700' },
  secondaryBtn: { height: 52, borderRadius: 12, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  secondaryTxt: { color: '#fff', fontWeight: '700' },
});
