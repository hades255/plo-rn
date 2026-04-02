import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const TOPICS = [
  {
    title: 'Ordering Tickets',
    items: [
      {
        q: 'How do I order a lottery ticket?',
        a: 'From Home, choose a draw or scratch game, then add to cart and checkout.',
      },
      {
        q: 'Can I cancel an order?',
        a: 'Orders cannot be cancelled once submitted because tickets are purchased immediately.',
      },
    ],
  },
  {
    title: 'Scratchers',
    items: [
      {
        q: 'How do I play a scratch ticket?',
        a: 'Open the purchased scratch ticket in Orders, then swipe to reveal the play area.',
      },
      {
        q: 'Can I reveal without scratching?',
        a: "Yes, use the 'Reveal All' button to instantly reveal the ticket.",
      },
    ],
  },
  {
    title: 'Winnings and Redemption',
    items: [
      {
        q: 'When will I receive my winnings?',
        a: 'Small winnings are usually credited shortly after reveal.',
      },
      {
        q: 'How do I withdraw my winnings?',
        a: 'Use the withdraw flow from your profile once identity verification is complete.',
      },
    ],
  },
];

export function HelpSupportScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: String((user as Record<string, unknown> | null)?.name ?? ''),
    email: String((user as Record<string, unknown> | null)?.email ?? ''),
    message: '',
  });

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return TOPICS.flatMap(topic =>
      topic.items
        .filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
        .map(item => ({ ...item, topic: topic.title })),
    );
  }, [query]);

  const selectedTopic = TOPICS.find(t => t.title === openTopic);

  const submitContact = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.profile.support.contact(form);
      setShowContact(false);
      setForm(prev => ({ ...prev, message: '' }));
      Alert.alert('Message sent', "We'll get back to you soon.");
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Help & Support</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for help..."
        style={styles.input}
      />

      {query.trim() ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results ({searchResults.length})</Text>
          {searchResults.map((item, idx) => (
            <View key={`${item.q}-${idx}`} style={styles.qaCard}>
              <Text style={styles.qaTopic}>{item.topic}</Text>
              <Text style={styles.qaQ}>{item.q}</Text>
              <Text style={styles.qaA}>{item.a}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        {TOPICS.map(topic => (
          <TouchableOpacity
            key={topic.title}
            style={styles.menuCard}
            onPress={() => setOpenTopic(topic.title)}>
            <Text style={styles.menuTitle}>{topic.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.contactBtn} onPress={() => setShowContact(true)}>
        <Text style={styles.contactBtnText}>Contact Support</Text>
      </TouchableOpacity>

      <Modal visible={Boolean(selectedTopic)} animationType="slide">
        <View style={styles.modalScreen}>
          <TouchableOpacity onPress={() => setOpenTopic(null)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{selectedTopic?.title}</Text>
          <ScrollView contentContainerStyle={styles.modalList}>
            {selectedTopic?.items.map(item => (
              <View key={item.q} style={styles.qaCard}>
                <Text style={styles.qaQ}>{item.q}</Text>
                <Text style={styles.qaA}>{item.a}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showContact} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.contactModal}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <TextInput
              value={form.name}
              onChangeText={v => setForm(p => ({ ...p, name: v }))}
              placeholder="Name"
              style={styles.input}
            />
            <TextInput
              value={form.email}
              onChangeText={v => setForm(p => ({ ...p, email: v }))}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              value={form.message}
              onChangeText={v => setForm(p => ({ ...p, message: v }))}
              placeholder="How can we help?"
              multiline
              style={[styles.input, styles.messageInput]}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowContact(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, submitting && styles.disabled]}
                disabled={submitting}
                onPress={submitContact}>
                <Text style={styles.sendText}>{submitting ? 'Sending…' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.homeBtnText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  section: { gap: 8 },
  sectionTitle: { fontWeight: '700', color: '#111827' },
  qaCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  qaTopic: { fontSize: 12, color: '#6B7280' },
  qaQ: { fontWeight: '700', color: '#111827' },
  qaA: { color: '#4B5563' },
  menuCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: { flex: 1, color: '#111827', fontWeight: '600' },
  menuArrow: { color: '#9CA3AF', fontSize: 24 },
  contactBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  contactBtnText: { color: '#4B5563', fontWeight: '600' },
  modalScreen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  back: { color: '#FF5B04', fontWeight: '700' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalList: { gap: 10 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  contactModal: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10 },
  messageInput: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#111827', fontWeight: '600' },
  sendBtn: {
    flex: 1,
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5B04',
  },
  sendText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  homeBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { color: '#111827', fontWeight: '600' },
});
