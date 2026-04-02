import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SelfExclusion'>;

const OPTIONS = [1, 3, 5];

export function SelfExclusionScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [years, setYears] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!years) {
      return;
    }
    setSubmitting(true);
    try {
      await api.profile.responsibleGaming.selfExclusion({ periodYears: years });
      Alert.alert('Submitted', 'Self-exclusion has been submitted. You will be logged out.');
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not submit self-exclusion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Self-Exclusion</Text>
      <Text style={styles.body}>
        Choose a period to block access to play. You will be logged out immediately once submitted.
      </Text>
      <View style={styles.options}>
        {OPTIONS.map(y => (
          <TouchableOpacity
            key={y}
            style={[styles.option, years === y && styles.optionActive]}
            onPress={() => setYears(y)}>
            <Text style={[styles.optionText, years === y && styles.optionTextActive]}>{y} Year{y > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.submit, (!years || submitting) && styles.disabled]}
        onPress={submit}
        disabled={!years || submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit Self-Exclusion'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  body: { color: '#4B5563', lineHeight: 22 },
  options: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
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
