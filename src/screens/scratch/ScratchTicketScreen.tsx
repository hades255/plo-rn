import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useScratchCart } from '../../store/ScratchCartContext';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ScratchTicket'>;

const BRUSH_PX = 24;
const REVEAL_THRESHOLD = 90;

type StrokePoint = { x: number; y: number; t?: number };

async function resolveImageUri(src: unknown): Promise<string | null> {
  if (src == null) {
    return null;
  }
  if (typeof src === 'string') {
    if (src.startsWith('http')) {
      return src;
    }
    try {
      const data = await api.orders.scratch.getImageUrl(src);
      return data?.presigned_url ?? null;
    } catch {
      return null;
    }
  }
  if (typeof src === 'object' && src !== null && 'id' in src) {
    const id = String((src as { id: string }).id);
    try {
      const data = await api.orders.scratch.getImageUrl(id);
      return data?.presigned_url ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export function ScratchTicketScreen({ navigation, route }: Props) {
  const ticketRef = route.params?.ticketRef;
  const { dispatch } = useScratchCart();

  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [unscratchedUri, setUnscratchedUri] = useState<string | null>(null);
  const [scratchedUri, setScratchedUri] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [revealPercent, setRevealPercent] = useState(0);
  const [playAgainLoading, setPlayAgainLoading] = useState(false);

  const recordedStrokesRef = useRef<StrokePoint[]>([]);
  const revealTriggeredRef = useRef(false);
  const scratchAreaRef = useRef({ width: 1, height: 1 });

  useEffect(() => {
    if (!ticketRef) {
      navigation.replace('Orders', { type: 'scratch', tag: 0 });
      return;
    }
    setLoading(true);
    api.orders.scratch
      .getTicket(ticketRef, true)
      .then(async data => {
        const t = data?.ticket;
        if (!t || typeof t !== 'object') {
          setTicket(null);
          setLoading(false);
          return;
        }
        const tk = t as Record<string, unknown>;
        setTicket(tk);
        const status = String(tk.status ?? '');
        if (status === 'REVEALED' || status === 'WIN_CREDITED') {
          setIsRevealed(true);
          setRevealPercent(100);
          setShowResult(true);
        } else if (status !== 'DELIVERED_DIGITALLY') {
          setTicket(null);
        }

        const unscratched =
          tk.frontUnscratchedImage ?? tk.image ?? tk.front_unscratched_image;
        const scratched =
          tk.frontScratchedImage ?? tk.image ?? tk.front_scratched_image;

        const [u, s] = await Promise.all([
          resolveImageUri(unscratched),
          resolveImageUri(scratched),
        ]);
        setUnscratchedUri(u);
        setScratchedUri(s);
      })
      .catch(() => {
        setTicket(null);
      })
      .finally(() => setLoading(false));
  }, [navigation, ticketRef]);

  const canScratch =
    ticket != null &&
    String(ticket.status) === 'DELIVERED_DIGITALLY' &&
    !isRevealed;

  const winnings = useMemo(() => {
    if (!ticket) {
      return 0;
    }
    const w = ticket.winnings;
    if (typeof w === 'number') {
      return w;
    }
    const cents = ticket.prizeAmountCents;
    if (typeof cents === 'number') {
      return cents / 100;
    }
    return 0;
  }, [ticket]);

  const handleRevealWithValues = useCallback(
    async (strokesValue: StrokePoint[] | null) => {
      if (!ticketRef || submitting || isRevealed || !canScratch) {
        return;
      }
      revealTriggeredRef.current = true;
      setSubmitting(true);
      setProcessing(true);
      try {
        const res = (await api.orders.scratch.reveal(
          ticketRef,
          strokesValue && strokesValue.length > 0 ? strokesValue : null,
          BRUSH_PX,
        )) as { ticket?: Record<string, unknown> };
        const u = res?.ticket;
        setTimeout(() => {
          setIsRevealed(true);
          setRevealPercent(100);
          setTicket(prev => {
            if (!prev || !u) {
              return prev;
            }
            return {
              ...prev,
              status: u.status ?? prev.status,
              prizeAmountCents: u.prizeAmountCents ?? prev.prizeAmountCents,
              winnings:
                u.prizeAmountCents != null
                  ? Number(u.prizeAmountCents) / 100
                  : (prev.winnings as number) ?? 0,
            };
          });
          setProcessing(false);
          setShowResult(true);
          setSubmitting(false);
        }, 2000);
      } catch {
        revealTriggeredRef.current = false;
        setProcessing(false);
        setSubmitting(false);
      }
    },
    [canScratch, isRevealed, submitting, ticketRef],
  );

  const onLayoutScratch = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      scratchAreaRef.current = { width: Math.max(1, width), height: Math.max(1, height) };
    },
    [],
  );

  const addStrokePoint = useCallback(
    (locationX: number, locationY: number) => {
      if (revealTriggeredRef.current || !canScratch || submitting) {
        return;
      }
      const { width, height } = scratchAreaRef.current;
      const nx = locationX / width;
      const ny = locationY / height;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
        return;
      }
      recordedStrokesRef.current = [
        ...recordedStrokesRef.current,
        { x: nx, y: ny, t: Date.now() },
      ];
      setRevealPercent(prev => {
        const next = Math.min(100, prev + 1.2);
        if (next >= REVEAL_THRESHOLD && !revealTriggeredRef.current && canScratch && !submitting) {
          revealTriggeredRef.current = true;
          setTimeout(() => {
            handleRevealWithValues(recordedStrokesRef.current);
          }, 100);
        }
        return next;
      });
    },
    [canScratch, handleRevealWithValues, submitting],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Boolean(canScratch && !submitting),
        onMoveShouldSetPanResponder: () => Boolean(canScratch && !submitting),
        onPanResponderGrant: evt => {
          addStrokePoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderMove: evt => {
          addStrokePoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
      }),
    [addStrokePoint, canScratch, submitting],
  );

  const handleRevealAll = () => {
    handleRevealWithValues(recordedStrokesRef.current.length > 0 ? recordedStrokesRef.current : null);
  };

  const handlePlayAgain = async () => {
    const gameId = ticket?.gameId;
    if (!gameId || playAgainLoading) {
      return;
    }
    setPlayAgainLoading(true);
    try {
      const game = await api.games.getScratchById(String(gameId));
      if (!game) {
        return;
      }
      const g = game as Record<string, unknown>;
      const priceRaw = g.pricePerPlay ?? g.price;
      const price =
        typeof priceRaw === 'string' ? parseFloat(priceRaw) || 0 : Number(priceRaw) || 0;
      const topPrizeRaw = g.topPrize ?? g.jackpot;
      const topPrize =
        typeof topPrizeRaw === 'string'
          ? parseFloat(topPrizeRaw) || 0
          : Number(topPrizeRaw) || 0;
      const image =
        (g.image as string) ??
        (g.frontUnscratchedImage as string) ??
        (g.frontScratchedImage as string);
      dispatch({
        type: 'ADD_ITEM',
        gameId: String(g.id),
        title: String(g.title ?? 'Scratch'),
        price,
        image,
        topPrize,
      });
      navigation.navigate('ScratchOrderCart');
    } finally {
      setPlayAgainLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF5B04" />
        <Text style={styles.loadingText}>Loading your ticket…</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Ticket not found</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.replace('Orders', { type: 'scratch', tag: 0 })}>
          <Text style={styles.primaryTxt}>Back to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = String(ticket.title ?? 'Scratch Ticket');
  const displayUri = isRevealed ? scratchedUri ?? unscratchedUri : unscratchedUri;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View
        style={styles.scratchWrap}
        onLayout={onLayoutScratch}
        {...(canScratch ? panResponder.panHandlers : {})}>
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.ticketImage} resizeMode="contain" />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No preview</Text>
          </View>
        )}
        {canScratch && !isRevealed ? (
          <View style={styles.overlayHint} pointerEvents="none">
            <Text style={styles.overlayHintText}>Swipe to scratch</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${Math.min(100, isRevealed ? 100 : revealPercent)}%` }]}
        />
      </View>
      <Text style={styles.progressLabel}>
        {Math.round(Math.min(100, isRevealed ? 100 : revealPercent))}% revealed
      </Text>

      {canScratch ? (
        <TouchableOpacity
          style={[styles.revealBtn, submitting && styles.btnDisabled]}
          disabled={submitting}
          onPress={handleRevealAll}>
          <Text style={styles.revealBtnText}>{submitting ? 'Revealing…' : 'Reveal All'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.playAgainBtn}
          disabled={playAgainLoading}
          onPress={handlePlayAgain}>
          <Text style={styles.playAgainText}>{playAgainLoading ? 'Adding…' : 'Play Again'}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.modalText}>Revealing…</Text>
        </View>
      </Modal>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowResult(false)} />
          <View style={styles.resultCard}>
            {winnings > 0 ? (
              <>
                <Text style={styles.resultTitle}>You won!</Text>
                <Text style={styles.resultAmount}>{formatMoney(winnings)}</Text>
                <Text style={styles.resultSub}>Congratulations!</Text>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>Not a winner</Text>
                <Text style={styles.resultSub}>Try again next time.</Text>
              </>
            )}
            <TouchableOpacity style={styles.resultClose} onPress={() => setShowResult(false)}>
              <Text style={styles.resultCloseText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: W } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#4A5565' },
  empty: { color: '#64748B', marginBottom: 16 },
  topBar: {
    backgroundColor: '#FF5B04',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { color: '#fff', fontWeight: '700', fontSize: 16 },
  topTitle: { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 },
  scratchWrap: {
    flex: 1,
    minHeight: 320,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: W * 1.1,
  },
  ticketImage: { width: '100%', height: '100%' },
  noImage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 280 },
  noImageText: { color: '#9CA3AF' },
  overlayHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  overlayHintText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5B04',
    borderRadius: 3,
  },
  progressLabel: { textAlign: 'center', marginTop: 6, color: '#4A5565', fontSize: 13 },
  revealBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.6 },
  playAgainBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#00AE81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF5B04',
    borderRadius: 12,
  },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalText: { color: '#fff', fontSize: 16 },
  resultBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  resultTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  resultAmount: { fontSize: 36, fontWeight: '800', color: '#059669', marginVertical: 8 },
  resultSub: { color: '#6B7280', marginBottom: 16 },
  resultClose: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 32 },
  resultCloseText: { color: '#FF5B04', fontWeight: '700', fontSize: 16 },
});
