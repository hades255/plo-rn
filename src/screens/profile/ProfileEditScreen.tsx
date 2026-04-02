import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/api';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEdit'>;

export function ProfileEditScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    zipCode: '',
    email: '',
    state: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    api.profile
      .get()
      .then(data => {
        const u = data?.user as Record<string, unknown> | undefined;
        if (!u) {
          return;
        }
        setForm({
          name: String(u.name ?? ''),
          firstName: String(u.firstName ?? ''),
          lastName: String(u.lastName ?? ''),
          phone: String(u.phone ?? ''),
          zipCode: String(u.zipCode ?? u.zip_code ?? ''),
          email: String(u.email ?? ''),
          state: String(u.state ?? ''),
          dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth) : '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5B04" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile Details</Text>
      <Text style={styles.hint}>
        Contact us to update your personal information. We are here to help.
      </Text>

      <Field label="Name" value={form.name} />
      <Field label="First name" value={form.firstName} />
      <Field label="Last name" value={form.lastName} />
      <Field label="Date of birth" value={form.dateOfBirth} />
      <Field label="Phone" value={form.phone} />
      <Field label="Zip code" value={form.zipCode} />
      <Field label="State" value={form.state} />
      <Field label="Email" value={form.email} />

      <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('HelpSupport')}>
        <Text style={styles.contactBtnText}>Contact us</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} editable={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  hint: { color: '#4A5565', marginBottom: 8 },
  field: { gap: 4 },
  label: { color: '#4A5565', fontSize: 13, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    color: '#101828',
  },
  contactBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#59CE73',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
