import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { NY_LOTTERY_FIND_A_RETAILER_URL } from '../../config/public';
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type KycPayload = {
  kycStatus?: string;
  verifiedForOrdering?: boolean;
  soft?: { result?: string };
};

function computeSoftFailed(k: KycPayload | null) {
  const r = k?.soft?.result;
  return r === 'failed' || r === 'low_confidence' || r === 'no_result';
}

export function ProfileScreen({ navigation }: Props) {
  const { user: authUser, logout } = useAuth();
  const [profileUser, setProfileUser] = useState<Record<string, unknown> | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [kycPayload, setKycPayload] = useState<KycPayload | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(
    authUser && typeof authUser === 'object' && 'kycStatus' in authUser
      ? String((authUser as { kycStatus?: string }).kycStatus ?? '')
      : null,
  );
  const [loading, setLoading] = useState(true);

  const authId =
    authUser && typeof authUser === 'object' && 'id' in authUser
      ? String((authUser as { id?: unknown }).id)
      : undefined;

  const user = (profileUser ?? authUser ?? {}) as Record<string, unknown>;

  const loadProfileBalance = useCallback(async () => {
    try {
      const data = await api.profile.get();
      if (data?.user) {
        setProfileUser(data.user);
      }
      if (typeof data?.balance?.payable === 'number') {
        setBalance(data.balance.payable);
      } else if (typeof data?.balance?.balance === 'number') {
        setBalance(data.balance.balance);
      } else if (data?.user && typeof (data.user as Record<string, unknown>).balance === 'object') {
        const ub = (data.user as { balance?: { payable?: number } }).balance;
        if (typeof ub?.payable === 'number') {
          setBalance(ub.payable);
        }
      } else {
        const w = await api.wallet.getBalance();
        setBalance(Number(w?.payable ?? w?.balance ?? 0));
      }
    } catch {
      try {
        const w = await api.wallet.getBalance();
        setBalance(Number(w?.payable ?? w?.balance ?? 0));
      } catch {
        setBalance(0);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadProfileBalance();
      if (active) {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authId, loadProfileBalance]);

  useEffect(() => {
    if (user?.kycStatus) {
      setKycStatus(String(user.kycStatus));
    }
    let active = true;
    (async () => {
      try {
        const data = (await api.kyc.getStatus()) as KycPayload;
        if (!active) {
          return;
        }
        setKycPayload(data);
        setKycStatus(data?.kycStatus ?? 'required');
      } catch {
        if (active) {
          setKycStatus('required');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.kycStatus, authId]);

  const kycVerified = kycStatus === 'verified';
  const kycPending = kycStatus === 'pending';
  const verifiedForOrdering = !!kycPayload?.verifiedForOrdering;
  const softFailed = computeSoftFailed(kycPayload);

  const primaryDisplay =
    String(user.name ?? '').trim() ||
    (user.firstName && user.lastName
      ? `${String(user.firstName)} ${String(user.lastName)}`.trim()
      : '') ||
    '';

  const initials = primaryDisplay
    ? primaryDisplay
        .split(/\s+/)
        .map(s => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email
      ? String(user.email)[0].toUpperCase()
      : user.username
        ? String(user.username)[0].toUpperCase()
        : '?';

  const displayName = primaryDisplay || String(user.username ?? 'User');
  const displayEmail = String(user.email ?? '');

  const balanceDisplay =
    balance ??
    Number((user.balance as { payable?: number } | undefined)?.payable ?? 0);

  const openVerifyFlow = useCallback(() => {
    if (softFailed || verifiedForOrdering) {
      navigation.navigate('VerifyIdentity');
    } else {
      navigation.navigate('SoftTierKyc');
    }
  }, [navigation, softFailed, verifiedForOrdering]);

  const menuItems = useMemo(() => {
    type Item = {
      key: string;
      title: string;
      subtitle?: string;
      onPress: () => void;
      isVerify?: boolean;
      isPending?: boolean;
    };
    const items: Item[] = [];

    if (!kycVerified) {
      items.push({
        key: 'verify',
        title: kycPending ? 'Verification in progress' : 'Verify Identity',
        subtitle: kycPending
          ? 'Tap to check status'
          : softFailed
            ? 'Full verification (selfie + ID) required'
            : verifiedForOrdering
              ? 'Complete verification to withdraw'
              : 'Takes ~60 seconds · FREE $10 Scratcher',
        onPress: openVerifyFlow,
        isVerify: true,
        isPending: kycPending,
      });
    }

    items.push(
      {
        key: 'edit',
        title: 'Edit Profile',
        onPress: () => navigation.navigate('ProfileEdit'),
      },
      {
        key: 'settings',
        title: 'Settings',
        onPress: () => navigation.navigate('Settings'),
      },
      {
        key: 'financial',
        title: 'Financial Center',
        onPress: () => navigation.navigate('FinancialCenter'),
      },
      {
        key: 'privacy',
        title: 'Privacy Policy',
        onPress: () => navigation.navigate('PrivacyPolicy'),
      },
      {
        key: 'terms',
        title: 'Terms of Service',
        onPress: () => navigation.navigate('TermsOfService'),
      },
      {
        key: 'help',
        title: 'Help & Support',
        onPress: () => navigation.navigate('HelpSupport'),
      },
    );

    if (NY_LOTTERY_FIND_A_RETAILER_URL) {
      items.push({
        key: 'retailer',
        title: 'Find a Retailer',
        onPress: () => {
          Linking.openURL(NY_LOTTERY_FIND_A_RETAILER_URL).catch(() => {});
        },
      });
    }

    items.push(
      {
        key: 'scams',
        title: 'Avoid Lottery Scams',
        onPress: () => navigation.navigate('AvoidLotteryScams'),
      },
      {
        key: 'rg',
        title: 'Responsible Gaming',
        onPress: () => navigation.navigate('ResponsibleGaming'),
      },
    );

    return items;
  }, [
    kycVerified,
    kycPending,
    navigation,
    openVerifyFlow,
    softFailed,
    verifiedForOrdering,
  ]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5B04" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {kycVerified ? (
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{displayName}</Text>
          {kycVerified ? (
            <Text style={styles.badgeInline}>Verified</Text>
          ) : null}
        </View>
        {displayEmail ? <Text style={styles.email}>{displayEmail}</Text> : null}
      </View>

      <Text style={styles.sectionHeading}>Balance</Text>
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.balanceLabel}>Payable Balance</Text>
          <Text style={styles.balanceValue}>{formatMoney(balanceDisplay)}</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => navigation.navigate('FinancialCenter')}>
          <Text style={styles.detailsBtnText}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.depositWithdrawRow}>
        <TouchableOpacity
          style={[styles.halfBtn, styles.withdrawBtn]}
          onPress={() => navigation.navigate('Withdraw')}>
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.halfBtn, styles.depositBtn]}
          onPress={() => navigation.navigate('AddFunds')}>
          <Text style={styles.depositBtnText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      {menuItems.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.menuItem,
            item.isVerify && (item.isPending ? styles.menuPending : styles.menuVerify),
          ]}
          onPress={item.onPress}
          activeOpacity={0.85}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.menuItem, styles.logout]}
        onPress={async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        }}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32, gap: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5B04',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 26 },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00AE81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: { color: '#fff', fontSize: 12, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  name: { color: '#111827', fontWeight: '700', fontSize: 20 },
  badgeInline: {
    backgroundColor: '#F0FDF4',
    color: '#00AE81',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  email: { color: '#4A5565', fontSize: 14, marginTop: 4 },
  sectionHeading: { fontWeight: '800', fontSize: 20, color: '#111827', marginTop: 8 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 12,
  },
  balanceLabel: { color: '#4A5565', fontSize: 12 },
  balanceValue: { color: '#111827', fontWeight: '800', fontSize: 22, marginTop: 2 },
  detailsBtn: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  detailsBtnText: { color: '#1E40AF', fontWeight: '700', fontSize: 13 },
  depositWithdrawRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  halfBtn: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  withdrawBtn: { backgroundColor: '#DBEAFE' },
  withdrawBtnText: { color: '#1E40AF', fontWeight: '700' },
  depositBtn: { backgroundColor: '#3B82F6' },
  depositBtnText: { color: '#fff', fontWeight: '700' },
  menuItem: {
    borderWidth: 1,
    borderColor: '#D3DDDE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
    minHeight: 52,
    justifyContent: 'center',
  },
  menuVerify: {
    borderColor: '#FF5B04',
    backgroundColor: 'rgba(255, 91, 4, 0.06)',
    minHeight: undefined,
    paddingVertical: 16,
  },
  menuPending: {
    borderColor: '#FCD34D',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    minHeight: undefined,
    paddingVertical: 16,
  },
  menuTitle: { color: '#111827', fontWeight: '600', fontSize: 14 },
  menuSubtitle: { color: '#4A5565', fontSize: 12, marginTop: 4 },
  logout: { marginTop: 4, borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  logoutText: { color: '#E7000B', fontWeight: '700', textAlign: 'center' },
});
