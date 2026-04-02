import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Withdraw'>;

const WITHDRAW_METHODS = [
  { id: 1, name: 'Bank Account', last4: '1234', brand: 'Checking' },
  { id: 2, name: 'PayPal', last4: '5678', brand: 'PayPal' },
];

export function WithdrawScreen({ navigation }: Props) {
  const { user, checkSession } = useAuth();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(WITHDRAW_METHODS[0]?.id);

  const userBalance = (user as Record<string, unknown> | null)?.balance as
    | { payable?: number }
    | undefined;
  const availableBalance = Number(userBalance?.payable ?? 0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.kyc.getStatus();
        if (active) {
          setKycStatus(String(data?.kycStatus ?? 'required'));
        }
      } catch {
        if (active) {
          setKycStatus('required');
        }
      } finally {
        if (active) {
          setKycLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const kycVerified = kycStatus === 'verified';

  const handleWithdraw = async () => {
    if (!kycVerified) {
      navigation.navigate('VerifyIdentity');
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      return;
    }
    try {
      // Placeholder until backend exposes withdraw endpoint in mobile client
      Alert.alert('Withdraw', 'Withdrawal request would be submitted here.', [
        { text: 'OK' },
      ]);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; kycStatus?: string; detail?: unknown } };
      const isKycRequired =
        e?.data?.error === 'kyc_required' || e?.data?.kycStatus === 'required';
      if (isKycRequired) {
        await checkSession?.();
        navigation.navigate('VerifyIdentity');
      }
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Withdraw</Text>

      {!kycLoading && !kycVerified ? (
        <TouchableOpacity
          style={styles.kycBanner}
          onPress={() => navigation.navigate('VerifyIdentity')}
          activeOpacity={0.9}>
          <Text style={styles.kycTitle}>Identity verification required</Text>
          <Text style={styles.kycSub}>Verify your identity to withdraw funds.</Text>
          <Text style={styles.kycLink}>Verify now</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Plotto</Text>
        <Text style={styles.heroSub}>Withdrawing your money from Plotto is secure and easy.</Text>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        style={styles.amountInput}
      />
      <Text style={styles.available}>
        {formatMoney(availableBalance)} available to withdraw
      </Text>

      <Text style={[styles.label, styles.labelSpaced]}>Method</Text>
      {WITHDRAW_METHODS.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.methodRow, index > 0 && styles.methodRowBorder]}
          onPress={() => setSelectedMethod(item.id)}
          activeOpacity={0.85}>
          <View style={styles.methodIcon}>
            <Text style={styles.methodIconText}>◇</Text>
          </View>
          <View style={styles.methodTextCol}>
            <Text style={styles.methodName}>{item.name}</Text>
            <Text style={styles.methodMeta}>
              {item.brand} ••{item.last4}
            </Text>
          </View>
          <View style={[styles.radio, selectedMethod === item.id && styles.radioOn]}>
            {selectedMethod === item.id ? <Text style={styles.radioCheck}>✓</Text> : null}
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.speed}>Speed: under 24 hours · Limits: $1–$25k</Text>

      <TouchableOpacity
        style={[styles.cta, kycVerified && (!amount || Number(amount) <= 0) && styles.ctaDisabled]}
        disabled={Boolean(kycVerified && (!amount || Number(amount) <= 0))}
        onPress={handleWithdraw}>
        <Text style={styles.ctaText}>{!kycVerified ? 'Verify identity to withdraw' : 'Withdraw'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('HelpSupport')}>
        <Text style={styles.helpLink}>Need help?</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Cashing out? Keep track of spending in{' '}
        <Text style={styles.footerLink} onPress={() => navigation.navigate('ResponsibleGaming')}>
          Responsible gaming
        </Text>
        .
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  kycBanner: {
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  kycTitle: { color: '#92400E', fontWeight: '700' },
  kycSub: { color: '#B45309', fontSize: 12, marginTop: 4 },
  kycLink: { color: '#92400E', fontWeight: '700', marginTop: 8, textDecorationLine: 'underline' },
  hero: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#2563EB' },
  heroSub: { color: '#4A5565', textAlign: 'center', marginTop: 8 },
  label: { color: '#4A5565', fontWeight: '600', marginBottom: 6 },
  labelSpaced: { marginTop: 16 },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
  },
  available: { color: '#4A5565', fontSize: 13, marginTop: 6 },
  methodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  methodRowBorder: { borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  methodIconText: { color: '#4A5565' },
  methodName: { fontWeight: '700', color: '#101828' },
  methodTextCol: { flex: 1 },
  methodMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: '#1876D0', backgroundColor: '#1876D0' },
  radioCheck: { color: '#fff', fontSize: 12, fontWeight: '800' },
  speed: { textAlign: 'center', color: '#6B7280', fontSize: 11, marginVertical: 12 },
  cta: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF5B04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  helpLink: { textAlign: 'center', color: '#1876D0', fontWeight: '600', marginTop: 14 },
  footer: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 20, lineHeight: 18 },
  footerLink: { color: '#1876D0', fontWeight: '600' },
});
