import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const BRUSH_KEY = 'plotto:scratch:brush:size';
const MIN_BRUSH = 10;
const MAX_BRUSH = 100;

function clampBrush(value: number) {
  return Math.max(MIN_BRUSH, Math.min(MAX_BRUSH, value));
}

export function SettingsScreen({ navigation }: Props) {
  const [brushSize, setBrushSize] = useState(40);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(BRUSH_KEY).then(v => {
      const n = Number(v);
      if (Number.isFinite(n)) {
        setBrushSize(clampBrush(n));
      }
    });
    api.profile.notifications
      .get()
      .then(prefs => {
        setPushEnabled(Boolean(prefs?.pushEnabled ?? true));
        setEmailEnabled(Boolean(prefs?.emailEnabled ?? true));
        setOrderUpdates(Boolean(prefs?.orderUpdates ?? true));
        setPromotions(Boolean(prefs?.promotions ?? false));
      })
      .catch(() => {});
  }, []);

  const saveBrush = async (value: number) => {
    const n = clampBrush(value);
    setBrushSize(n);
    await AsyncStorage.setItem(BRUSH_KEY, String(n));
  };

  const toggle = async (key: 'pushEnabled' | 'emailEnabled' | 'orderUpdates' | 'promotions', value: boolean) => {
    const setters = {
      pushEnabled: setPushEnabled,
      emailEnabled: setEmailEnabled,
      orderUpdates: setOrderUpdates,
      promotions: setPromotions,
    };
    const prev = { pushEnabled, emailEnabled, orderUpdates, promotions }[key];
    setters[key](value);
    try {
      await api.profile.notifications.update({ [key]: value });
    } catch (err) {
      setters[key](prev);
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not save preference');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sub}>Configure app preferences.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scratch Ticket</Text>
        <Text style={styles.label}>Brush size (10-100)</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => saveBrush(brushSize - 5)}>
            <Text style={styles.stepBtnTxt}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={String(brushSize)}
            onChangeText={text => {
              const n = Number(text.replace(/[^0-9]/g, ''));
              if (Number.isFinite(n)) {
                setBrushSize(clampBrush(n));
              }
            }}
            onBlur={() => saveBrush(brushSize)}
            keyboardType="number-pad"
            style={styles.brushInput}
          />
          <TouchableOpacity style={styles.stepBtn} onPress={() => saveBrush(brushSize + 5)}>
            <Text style={styles.stepBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Push notifications</Text>
          <Switch value={pushEnabled} onValueChange={v => toggle('pushEnabled', v)} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Email notifications</Text>
          <Switch value={emailEnabled} onValueChange={v => toggle('emailEnabled', v)} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Order updates</Text>
          <Switch value={orderUpdates} onValueChange={v => toggle('orderUpdates', v)} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Promotions</Text>
          <Switch value={promotions} onValueChange={v => toggle('promotions', v)} />
        </View>
      </View>

      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('PrivacyPolicy')}>
        <Text style={styles.navBtnTxt}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('TermsOfService')}>
        <Text style={styles.navBtnTxt}>Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('HelpSupport')}>
        <Text style={styles.navBtnTxt}>Help & Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#6B7280' },
  section: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  sectionTitle: { color: '#111827', fontWeight: '700' },
  label: { color: '#4B5563' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnTxt: { fontSize: 20, color: '#111827' },
  brushInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: { color: '#111827', fontWeight: '500' },
  navBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnTxt: { color: '#111827', fontWeight: '600' },
});
