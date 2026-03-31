import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout } from '../../components/AuthLayout';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLanding'>;

export function AuthLandingScreen({navigation}: Props) {
  return (
    <AuthLayout
      title="Plott."
      subtitle="Play lottery and scratch tickets safely. Order, scratch, and claim your wins.">
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.primaryText}>Sign up or Log in</Text>
      </TouchableOpacity>
      <Text style={styles.legal}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Create account</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#FF5B04',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  legal: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: '#4A5565',
    textAlign: 'center',
  },
  links: {
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    color: '#FF5B04',
    fontWeight: '600',
    fontSize: 14,
  },
});
