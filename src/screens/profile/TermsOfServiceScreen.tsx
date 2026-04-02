import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfService'>;

export function TermsOfServiceScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.updated}>Last Modified: December 31, 2025</Text>
      <View style={styles.warning}>
        <Text style={styles.warningText}>
          These terms include a waiver of trial by jury to the maximum extent permitted by law.
        </Text>
      </View>
      <Text style={styles.body}>
        These Terms govern your use of Plotto applications and services. Terms may be updated over
        time by posting revised versions.
      </Text>
      <Text style={styles.body}>
        When ordering a lottery ticket through Plotto, you place an order that is fulfilled through
        a licensed lottery retailer in the applicable jurisdiction.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  back: { color: '#FF5B04', fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  updated: { color: '#6B7280', fontSize: 13 },
  warning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
  },
  warningText: { color: '#92400E', fontWeight: '600', lineHeight: 20 },
  body: { color: '#4B5563', lineHeight: 22 },
});
