import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export function AvoidLotteryScamsScreen(_props: NativeStackScreenProps<RootStackParamList, 'AvoidLotteryScams'>) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>PLOTTO</Text>
      </View>
      <Text style={styles.title}>Avoid Lottery Scams</Text>
      <Text style={styles.body}>
        This is a warning to all consumers about scammers who are sending false announcements
        regarding lottery prizes.
      </Text>
      <Text style={styles.body}>
        As part of the scam, an individual is contacted by phone, email, text message, or a letter
        from a scammer who is claiming that the recipient has won a prize with a state lottery.
        Unless you hear from Plotto directly, this is a fraudulent claim and there is no such
        prize. Federal law prohibits the sale or mailing of lottery tickets across state lines. You
        may only purchase lottery tickets or set up a subscription in the state you are physically
        located. Never respond to these communications and never provide information or send money to
        a scammer.
      </Text>

      <Text style={styles.subheading}>Warning Signs</Text>
      <Text style={styles.bullet}>
        • Plotto never requires the payment of any money in order to claim a prize.
      </Text>
      <Text style={styles.bullet}>
        • No one should ever send any money to pay any processing fee or any other requested fee in
        order to claim a prize.
      </Text>
      <Text style={styles.bullet}>
        • Never deposit any check sent to you that is accompanied by a request that you send or wire
        money to cover processing or claiming fees. The check you have received is fraudulent and
        will bounce.
      </Text>
      <Text style={styles.bullet}>
        • Never provide any personal or financial information to a scammer, especially Social
        Security numbers, bank account numbers, and credit card numbers.
      </Text>

      <Text style={styles.subheading}>Report the Scam</Text>
      <Text style={styles.body}>
        Report any attempted scam to the Federal Trade Commission at 1-877-FTC-HELP or at the FTC
        Consumer Information website.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    backgroundColor: '#1876D0',
    marginHorizontal: -16,
    marginTop: -16,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
  },
  brand: { color: '#fff', fontWeight: '800', fontSize: 28 },
  title: { fontSize: 22, fontWeight: '800', color: '#101828', marginTop: 16, marginBottom: 8 },
  subheading: { fontSize: 16, fontWeight: '700', color: '#101828', marginTop: 16, marginBottom: 6 },
  body: { color: '#4A5565', lineHeight: 22, marginBottom: 8 },
  bullet: { color: '#4A5565', lineHeight: 22, marginBottom: 6 },
});
