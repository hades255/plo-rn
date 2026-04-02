import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last Updated: June 24, 2025</Text>
      <Text style={styles.body}>
        Plotto LLC provides this privacy policy to explain how and why personal information is
        collected and used when accessing our lottery services.
      </Text>
      <Text style={styles.body}>
        This policy should be read together with the Terms of Service. By using our services, you
        consent to the practices described in this policy.
      </Text>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => Linking.openURL('https://plotto.com/')}>
          <Text style={styles.link}>https://plotto.com/</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://casino.plotto.com/')}>
          <Text style={styles.link}>https://casino.plotto.com/</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  back: { color: '#FF5B04', fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  updated: { color: '#6B7280', fontSize: 13 },
  body: { color: '#4B5563', lineHeight: 22 },
  links: { gap: 8 },
  link: { color: '#2563EB', textDecorationLine: 'underline' },
});
