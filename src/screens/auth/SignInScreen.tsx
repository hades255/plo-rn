import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AuthLayout,
  CommonButton,
  commonInputStyle,
} from '../../components/AuthLayout';
import { useAuth } from '../../store/AuthContext';
import { getPostAuthRedirectRoute } from '../../store/kyc';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
type Method = 'phone' | 'email';

export function SignInScreen({navigation}: Props) {
  const { login, sendOTPSignin, verifyOTP } = useAuth();
  const [method, setMethod] = useState<Method>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneAction = async () => {
    setError('');
    setLoading(true);
    if (!otpSent) {
      const result = await sendOTPSignin(phone.trim());
      if (result.success) {
        setOtpSent(true);
      } else {
        setError(result.error || 'Failed to send code');
      }
    } else {
      const result = await verifyOTP(phone.trim(), otpCode);
      if (result.success) {
        const nextRoute = await getPostAuthRedirectRoute();
        navigation.replace(nextRoute);
      } else if (result.status === 404) {
        navigation.replace('SignUp', { fromPhoneSignIn: true, phone: phone.trim() });
      } else {
        setError(result.error || 'Invalid or expired code');
      }
    }
    setLoading(false);
  };

  const handleEmailSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await login({ email: email.trim(), password });
    if (result.success) {
      const nextRoute = await getPostAuthRedirectRoute();
      navigation.replace(nextRoute);
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Plott." subtitle="Sign in to your account">
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, method === 'phone' && styles.toggleActive]}
          onPress={() => {
            setMethod('phone');
            setOtpSent(false);
            setOtpCode('');
            setError('');
          }}>
          <Text
            style={[
              styles.toggleText,
              method === 'phone' && styles.toggleTextActive,
            ]}>
            Phone
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, method === 'email' && styles.toggleActive]}
          onPress={() => {
            setMethod('email');
            setError('');
          }}>
          <Text
            style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>
            Email
          </Text>
        </TouchableOpacity>
      </View>

      {method === 'phone' ? (
        <View>
          {!otpSent ? (
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 555 555 5555"
              style={commonInputStyle}
            />
          ) : (
            <TextInput
              value={otpCode}
              onChangeText={text => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="000000"
              style={[commonInputStyle, styles.codeInput]}
              maxLength={6}
            />
          )}
          {otpSent ? (
            <TouchableOpacity
              onPress={() => {
                setOtpSent(false);
                setOtpCode('');
              }}>
              <Text style={styles.link}>Change phone number</Text>
            </TouchableOpacity>
          ) : null}
          <CommonButton
            label={loading ? (otpSent ? 'Verifying...' : 'Sending...') : otpSent ? 'Verify Code' : 'Send Code'}
            onPress={handlePhoneAction}
            disabled={loading || (!otpSent ? !phone.trim() : otpCode.length < 6)}
          />
        </View>
      ) : (
        <View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="your@email.com"
            style={commonInputStyle}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            placeholder="Enter your password"
            style={[commonInputStyle, styles.inputGap]}
          />
          <CommonButton
            label={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleEmailSignIn}
            disabled={loading || !email.trim() || !password.trim()}
          />
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    color: '#4A5565',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FF5B04',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
  },
  inputGap: {
    marginTop: 10,
  },
  link: {
    marginTop: 8,
    textAlign: 'center',
    color: '#FF5B04',
    fontWeight: '600',
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
});
