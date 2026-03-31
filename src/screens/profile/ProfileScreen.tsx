import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user: authUser, logout } = useAuth();
  const [profileUser, setProfileUser] = useState<Record<string, unknown> | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [kycStatus, setKycStatus] = useState<string>('required');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.profile.get();
        if (!active) {
          return;
        }
        if (data?.user) {
          setProfileUser(data.user);
        }
        if (typeof data?.balance?.payable === 'number') {
          setBalance(data.balance.payable);
        } else if (typeof data?.balance?.balance === 'number') {
          setBalance(data.balance.balance);
        } else {
          const wallet = await api.wallet.getBalance();
          if (active) {
            setBalance(Number(wallet?.payable ?? wallet?.balance ?? 0));
          }
        }
      } catch {
        try {
          const wallet = await api.wallet.getBalance();
          if (active) {
            setBalance(Number(wallet?.payable ?? wallet?.balance ?? 0));
          }
        } catch {
          if (active) {
            setBalance(0);
          }
        }
      }
      try {
        const kyc = await api.kyc.getStatus();
        if (active) {
          setKycStatus(String(kyc?.kycStatus ?? 'required'));
        }
      } catch {
        if (active) {
          setKycStatus('required');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const user = (profileUser ?? authUser ?? {}) as Record<string, unknown>;
  const displayName = useMemo(() => {
    const name = String(user.name ?? '').trim();
    if (name) {
      return name;
    }
    const first = String(user.firstName ?? '').trim();
    const last = String(user.lastName ?? '').trim();
    const full = `${first} ${last}`.trim();
    if (full) {
      return full;
    }
    return String(user.username ?? 'User');
  }, [user.firstName, user.lastName, user.name, user.username]);
  const email = String(user.email ?? '');
  const initials = (displayName[0] ?? 'U').toUpperCase();
  const kycVerified = kycStatus === 'verified';

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {kycVerified ? <Text style={styles.badge}>Verified</Text> : null}
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Payable Balance</Text>
        <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.smallBtn, styles.outlineBtn]}
          onPress={() => navigation.navigate('VerifyIdentity')}>
          <Text style={styles.outlineBtnText}>
            {kycVerified ? 'Verification' : 'Verify Identity'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallBtn, styles.primaryBtn]}
          onPress={() => navigation.navigate('AddFunds')}>
          <Text style={styles.primaryBtnText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Orders', { type: 'draw', tag: 0 })}>
        <Text style={styles.menuText}>My Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('AddFunds')}>
        <Text style={styles.menuText}>Add Funds</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('VerifyIdentity')}>
        <Text style={styles.menuText}>Identity Verification</Text>
      </TouchableOpacity>

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
  content: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5B04',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 24 },
  name: { marginTop: 8, color: '#111827', fontWeight: '700', fontSize: 18 },
  email: { color: '#6B7280', marginTop: 4 },
  badge: {
    marginTop: 8,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BEDBFF',
  },
  balanceLabel: { color: '#4A5565', fontSize: 12 },
  balanceValue: { color: '#111827', fontSize: 28, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  smallBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { backgroundColor: '#FF5B04' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: { borderWidth: 1, borderColor: '#D1D5DB' },
  outlineBtnText: { color: '#111827', fontWeight: '600' },
  menuItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  menuText: { color: '#111827', fontWeight: '600' },
  logout: { marginTop: 8, borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  logoutText: { color: '#B91C1C', fontWeight: '700' },
});
