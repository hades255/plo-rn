import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FundsAdded'>;

export function FundsAddedScreen({ navigation, route }: Props) {
  const amount = Number(route.params?.amount ?? 0);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    api.wallet
      .getBalance()
      .then(data => setBalance(Number(data?.payable ?? data?.balance ?? 0)))
      .catch(() => setBalance(0));
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.check}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.title}>Funds Added</Text>
      <Text style={styles.amount}>+{formatMoney(amount)}</Text>
      {balance == null ? (
        <ActivityIndicator color="#FF5B04" style={styles.loader} />
      ) : (
        <Text style={styles.balance}>New Balance: {formatMoney(balance)}</Text>
      )}
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.primaryBtnText}>Back to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  check: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#00AE81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 40, fontWeight: '800' },
  title: { marginTop: 14, color: '#111827', fontWeight: '800', fontSize: 28 },
  amount: { marginTop: 6, color: '#059669', fontWeight: '800', fontSize: 34 },
  loader: { marginTop: 8 },
  balance: { marginTop: 6, color: '#4B5563' },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: '#FF5B04',
    borderRadius: 12,
    paddingHorizontal: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
