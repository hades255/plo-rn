import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AuthLayout,
  CommonButton,
  commonInputStyle,
} from '../../components/AuthLayout';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
const RESEND_COOLDOWN = 120;
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), ms));

export function SignUpScreen({navigation, route}: Props) {
  const fromPhoneSignIn = Boolean(route.params?.fromPhoneSignIn);
  const initialPhone = route.params?.phone ?? '';

  const [step, setStep] = useState(fromPhoneSignIn ? 3 : 1);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneCode, setPhoneCode] = useState('');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [stateName, setStateName] = useState('');
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (phoneCooldown <= 0 && emailCooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setPhoneCooldown(c => (c > 0 ? c - 1 : 0));
      setEmailCooldown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneCooldown, emailCooldown]);

  const stepCanContinue = useMemo(() => {
    if (step === 1) {
      return phone.trim().length > 0;
    }
    if (step === 2) {
      return phoneCode.length === 6;
    }
    if (step === 3) {
      return emailCodeSent ? emailCode.length === 6 : email.trim().length > 0;
    }
    return (
      firstName.trim() &&
      lastName.trim() &&
      username.trim() &&
      password.length >= 8 &&
      dateOfBirth.trim() &&
      zipCode.trim() &&
      stateName.trim() &&
      phone.trim() &&
      email.trim()
    );
  }, [
    dateOfBirth,
    email,
    emailCode,
    emailCodeSent,
    firstName,
    lastName,
    password,
    phone,
    phoneCode,
    stateName,
    step,
    username,
    zipCode,
  ]);

  const goBack = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onContinue = async () => {
    setError('');
    setLoading(true);
    await delay(550);

    if (step === 1) {
      setPhoneCooldown(RESEND_COOLDOWN);
      setStep(2);
      setLoading(false);
      return;
    }
    if (step === 2) {
      if (phoneCode.length !== 6) {
        setError('Enter the 6 digit code');
      } else {
        setStep(3);
      }
      setLoading(false);
      return;
    }
    if (step === 3) {
      if (!emailCodeSent) {
        setEmailCodeSent(true);
        setEmailCooldown(RESEND_COOLDOWN);
      } else if (emailCode.length === 6) {
        setStep(4);
      } else {
        setError('Enter the 6 digit code');
      }
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    navigation.replace('Home');
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Plott."
      subtitle="Create your account"
      footer={
        <View>
          <Text style={styles.smallText}>
            Play responsibly. You can set spending limits in your account after
            signing up.
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      }>
      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map(s => (
          <View
            key={s}
            style={[styles.progressItem, s <= step && styles.progressActive]}
          />
        ))}
      </View>

      {step === 1 ? (
        <View>
          <Text style={styles.stepTitle}>Enter your phone number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1 555 555 5555"
            style={[commonInputStyle, styles.inputGap]}
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <Text style={styles.stepTitle}>Enter verification code</Text>
          <TextInput
            value={phoneCode}
            onChangeText={text => setPhoneCode(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            maxLength={6}
            style={[commonInputStyle, styles.codeInput, styles.inputGap]}
          />
          <Text style={styles.smallText}>
            {phoneCooldown > 0
              ? `Resend code in ${phoneCooldown}s`
              : 'You can request a new code now'}
          </Text>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          {!emailCodeSent ? (
            <>
              <Text style={styles.stepTitle}>Verify your email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="your@email.com"
                style={[commonInputStyle, styles.inputGap]}
              />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Enter email verification code</Text>
              <TextInput
                value={emailCode}
                onChangeText={text => setEmailCode(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
                style={[commonInputStyle, styles.codeInput, styles.inputGap]}
              />
              <Text style={styles.smallText}>
                {emailCooldown > 0
                  ? `Resend code in ${emailCooldown}s`
                  : 'You can request a new code now'}
              </Text>
            </>
          )}
        </View>
      ) : null}

      {step === 4 ? (
        <View>
          <Text style={styles.stepTitle}>Create account details</Text>
          <View style={styles.row}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              style={[commonInputStyle, styles.flexHalf]}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              style={[commonInputStyle, styles.flexHalf]}
            />
          </View>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            style={[commonInputStyle, styles.inputGap]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            placeholder="Password (8+ chars)"
            style={[commonInputStyle, styles.inputGap]}
          />
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Promo code (optional)"
            style={[commonInputStyle, styles.inputGap]}
          />
          <TextInput
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="DOB (YYYY-MM-DD)"
            style={[commonInputStyle, styles.inputGap]}
          />
          <TextInput
            value={zipCode}
            onChangeText={text => setZipCode(text.replace(/[^0-9-]/g, '').slice(0, 10))}
            keyboardType="number-pad"
            placeholder="ZIP code"
            style={[commonInputStyle, styles.inputGap]}
          />
          <TextInput
            value={stateName}
            onChangeText={setStateName}
            placeholder="State"
            style={[commonInputStyle, styles.inputGap]}
          />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actionRow}>
        {step > 1 ? (
          <View style={styles.actionButton}>
            <CommonButton label="Back" onPress={goBack} kind="secondary" />
          </View>
        ) : null}
        <View style={styles.actionButton}>
          <CommonButton
            label={
              loading
                ? 'Working...'
                : step === 4
                ? 'Create Account'
                : step === 3 && !emailCodeSent
                ? 'Send Code'
                : 'Continue'
            }
            onPress={onContinue}
            disabled={loading || !stepCanContinue}
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  progressItem: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  progressActive: {
    backgroundColor: '#FF5B04',
  },
  stepTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 6,
  },
  inputGap: {
    marginTop: 8,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
  },
  smallText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4A5565',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  error: {
    marginTop: 8,
    color: '#DC2626',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  bottomRow: {
    marginTop: 8,
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
