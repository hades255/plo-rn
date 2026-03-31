import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ScratchOrderDetails'>;

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created',
  PAID_AUTHORIZED: 'Paid',
  RESERVED: 'Reserved',
  PICKED: 'Picked',
  DELIVERED_DIGITALLY: 'Ready to play',
  REVEALED: 'Revealed',
  WIN_CREDITED: 'Win credited',
  VALIDATED: 'Validated',
  CLAIM_REQUIRED: 'Claim required',
};

export function ScratchOrderDetailsScreen({ navigation, route }: Props) {
  const ticketRef = route.params?.ticketRef;
  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketRef) {
      navigation.replace('Orders', { type: 'scratch', tag: 0 });
      return;
    }
    setLoading(true);
    api.orders.scratch
      .getTicket(ticketRef)
      .then(data => setTicket((data?.ticket as Record<string, unknown>) ?? null))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [navigation, ticketRef]);

  const firstImage = Array.isArray(ticket?.imageAssets) && ticket.imageAssets.length > 0
    ? (ticket.imageAssets[0] as { id?: string }).id
    : null;

  useEffect(() => {
    if (!firstImage) {
      setImageUrl(null);
      return;
    }
    api.orders.scratch
      .getImageUrl(String(firstImage))
      .then(data => setImageUrl(data?.presigned_url ?? null))
      .catch(() => setImageUrl(null));
  }, [firstImage]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5B04" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Ticket not found.</Text>
      </View>
    );
  }

  const title = String(ticket.title ?? 'Scratch Ticket');
  const code = String(ticket.ticketCode ?? ticket.ticketRef ?? '');
  const statusRaw = String(ticket.status ?? '');
  const status = STATUS_LABELS[statusRaw] ?? statusRaw;
  const ordered = formatDateTime(ticket.orderedAt);
  const total = Number(ticket.total ?? 0);
  const winnings =
    Number(ticket.winnings ?? ((ticket.prizeAmountCents as number | undefined) != null ? (ticket.prizeAmountCents as number) / 100 : 0));
  const isRevealed = statusRaw === 'REVEALED' || statusRaw === 'WIN_CREDITED';
  const canScratch = statusRaw === 'DELIVERED_DIGITALLY';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.ref}>{code}</Text>
      </View>

      <View style={styles.body}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>No image</Text>
          </View>
        )}

        <View style={styles.card}>
          <Row label="Status" value={status} />
          <Row label="Ordered" value={ordered || '—'} />
          <Row label="Price" value={formatMoney(total)} />
          {isRevealed ? <Row label="Prize" value={formatMoney(winnings)} /> : null}
        </View>

        {canScratch ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('ScratchTicket', { ticketRef: String(ticket.ticketRef ?? ticketRef) })}>
            <Text style={styles.primaryTxt}>Scratch Now</Text>
          </TouchableOpacity>
        ) : null}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#64748B' },
  header: { padding: 14, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  back: { color: '#111827', fontWeight: '700' },
  headerTitle: { marginTop: 8, color: '#111827', fontSize: 20, fontWeight: '700' },
  ref: { marginTop: 2, color: '#6B7280' },
  body: { padding: 12, gap: 12 },
  image: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#F3F4F6' },
  imageFallback: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { color: '#9CA3AF' },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: '#6B7280' },
  rowValue: { color: '#111827', fontWeight: '600' },
  primaryBtn: { height: 48, borderRadius: 12, backgroundColor: '#FF5B04', alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
});
