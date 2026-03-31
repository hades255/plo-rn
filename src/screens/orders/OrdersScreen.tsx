import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { DrawOrdersScreen } from './DrawOrdersScreen';
import { ScratchOrdersScreen } from './ScratchOrdersScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;
type TicketType = 'draw' | 'scratch';

export function OrdersScreen({ navigation, route }: Props) {
  const initialType = route.params?.type === 'scratch' ? 'scratch' : 'draw';
  const initialTag = route.params?.tag ?? 0;
  const [type, setType] = useState<TicketType>(initialType);
  const [tag, setTag] = useState<0 | 1 | 2>(initialTag);

  const heading = useMemo(() => (type === 'draw' ? 'Draw Tickets' : 'Scratch Tickets'), [type]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Orders</Text>
      <Text style={styles.subtitle}>Track your tickets & wins</Text>

      <View style={styles.typeTabs}>
        <TouchableOpacity
          style={[styles.typeTab, type === 'draw' && styles.typeTabActive]}
          onPress={() => setType('draw')}>
          <Text style={[styles.typeTabText, type === 'draw' && styles.typeTabTextActive]}>
            Draw
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeTab, type === 'scratch' && styles.typeTabActive]}
          onPress={() => setType('scratch')}>
          <Text style={[styles.typeTabText, type === 'scratch' && styles.typeTabTextActive]}>
            Scratch
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>{heading}</Text>
      <View style={styles.container}>
        {type === 'draw' ? (
          <DrawOrdersScreen navigation={navigation as never} route={{ key: 'DrawOrders', name: 'DrawOrders', params: { tag } } as never} embed onChangeTag={setTag} />
        ) : (
          <ScratchOrdersScreen navigation={navigation as never} route={{ key: 'ScratchOrders', name: 'ScratchOrders', params: { tag } } as never} embed onChangeTag={setTag} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 14, paddingTop: 14 },
  title: { color: '#111827', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#4A5565', marginTop: 4 },
  typeTabs: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typeTab: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  typeTabActive: { backgroundColor: '#fff' },
  typeTabText: { color: '#4A5565', fontWeight: '600' },
  typeTabTextActive: { color: '#FF5B04' },
  section: { marginTop: 10, color: '#111827', fontWeight: '700' },
  container: { flex: 1, marginTop: 8 },
});
