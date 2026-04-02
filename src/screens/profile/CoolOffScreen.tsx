import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CoolOff'>;

const OPTIONS = [3, 7, 14, 30];

export function CoolOffScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [days, setDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!days) {
      return;
    }
    setSubmitting(true);
    try {
      await api.profile.responsibleGaming.coolOff({ periodDays: days });
      Alert.alert('Submitted', 'Cool-off period has been set. You will be logged out.');
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not submit cool-off period');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cool-Off Period</Text>
      <Text style={styles.body}>
        A Cool-Off is a short-term break that temporarily prevents logging in or playing.
      </Text>
      <View style={styles.options}>
        {OPTIONS.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.option, days === v && styles.optionActive]}
            onPress={() => setDays(v)}>
            <Text style={[styles.optionText, days === v && styles.optionTextActive]}>{v} Days</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.submit, (!days || submitting) && styles.disabled]}
        disabled={!days || submitting}
        onPress={submit}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit Cool-Off'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  body: { color: '#4B5563', lineHeight: 22 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minWidth: '47%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionActive: { borderColor: '#FF5B04', backgroundColor: '#FFF7ED' },
  optionText: { color: '#111827', fontWeight: '600' },
  optionTextActive: { color: '#C2410C' },
  submit: {
    marginTop: 4,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
