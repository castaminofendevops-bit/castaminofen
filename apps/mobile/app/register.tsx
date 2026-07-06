import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { AuthResponse } from '@castaminofen/shared';
import { rawFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { AuthScreenLayout, useAuthStyles } from '@/components/AuthScreenLayout';
import { useAppTheme } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const authStyles = useAuthStyles();
  const setAuth = usePlayerStore((s) => s.setAuth);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async () => {
    const name = displayName.trim();
    const mail = email.trim();

    if (name.length < 2) {
      setError('نام نمایشی باید حداقل ۲ کاراکتر باشد');
      return;
    }
    if (!mail.includes('@')) {
      setError('ایمیل معتبر وارد کنید');
      return;
    }
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیست');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await rawFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: mail, password, displayName: name }),
      });

      if (res.success && res.data) {
        await setAuth(
          { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
          res.data.user,
        );
        router.back();
      } else {
        setError(res.error?.message || 'خطا در ثبت‌نام');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="ساخت حساب جدید"
      subtitle="به جامعه کستامینوفن بپیوندید"
      footerText="قبلاً ثبت‌نام کرده‌اید؟"
      footerLinkText="ورود"
      footerHref="/login"
    >
      <TextInput
        style={authStyles.input}
        placeholder="نام نمایشی"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
        textAlign="right"
        accessibilityLabel="نام نمایشی"
      />
      <TextInput
        style={authStyles.input}
        placeholder="ایمیل"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textAlign="right"
        accessibilityLabel="ایمیل"
      />
      <TextInput
        style={authStyles.input}
        placeholder="رمز عبور (حداقل ۸ کاراکتر)"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textAlign="right"
        accessibilityLabel="رمز عبور"
      />
      <TextInput
        style={authStyles.input}
        placeholder="تکرار رمز عبور"
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        textAlign="right"
        accessibilityLabel="تکرار رمز عبور"
      />
      {error ? <Text style={authStyles.error} accessibilityRole="alert">{error}</Text> : null}
      <TouchableOpacity
        style={[authStyles.btn, loading && authStyles.btnDisabled]}
        onPress={register}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'در حال ثبت‌نام' : 'ثبت‌نام'}
        accessibilityState={{ disabled: loading, busy: loading }}
      >
        <Text style={authStyles.btnText}>{loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}
