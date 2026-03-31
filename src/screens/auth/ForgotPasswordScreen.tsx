import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AuthLayout,
  CommonButton,
  commonInputStyle,
} from '../../components/AuthLayout';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
const RESEND_COOLDOWN = 120;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ForgotPasswordScreen({navigation}: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onContinue = async () => {
    setError('');
    setLoading(true);
    await delay(550);

    if (step === 1) {
      if (!email.trim()) {
        setError('Email is required');
      } else {
        setStep(2);
        setCooldown(RESEND_COOLDOWN);
      }
      setLoading(false);
      return;
    }

    if (step === 2) {
      if (code.length !== 6) {
        setError('Enter the 6 digit code');
      } else {
        setStep(3);
      }
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      navigation.replace('SignIn');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Plott." subtitle="Reset your password">
      {step === 1 ? (
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="your@email.com"
          style={commonInputStyle}
        />
      ) : null}

      {step === 2 ? (
        <View>
          <TextInput
            value={code}
            onChangeText={text => setCode(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            maxLength={6}
            style={[commonInputStyle, styles.codeInput]}
          />
          <Text style={styles.smallText}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'You can resend now'}
          </Text>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            placeholder="New password"
            style={commonInputStyle}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry
            placeholder="Confirm new password"
            style={[commonInputStyle, styles.inputGap]}
          />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <CommonButton
        label={
          loading
            ? 'Working...'
            : step === 1
            ? 'Send reset code'
            : step === 2
            ? 'Verify code'
            : 'Reset password'
        }
        onPress={onContinue}
        disabled={
          loading ||
          (step === 1 && !email.trim()) ||
          (step === 2 && code.length < 6) ||
          (step === 3 && (!password || !confirmPassword))
        }
      />

      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
          <Text style={styles.link}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  inputGap: {
    marginTop: 10,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
  },
  smallText: {
    marginTop: 8,
    color: '#4A5565',
    textAlign: 'center',
    fontSize: 12,
  },
  error: {
    marginTop: 10,
    color: '#DC2626',
    fontSize: 13,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    color: '#4A5565',
    fontSize: 14,
  },
  link: {
    color: '#FF5B04',
    fontWeight: '600',
    fontSize: 14,
  },
});
