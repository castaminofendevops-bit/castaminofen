import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { AuthResponse } from '@castaminofen/shared';
import { rawFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { AuthScreenLayout, useAuthStyles } from '@/components/AuthScreenLayout';
import { useAppTheme } from '@/context/ThemeContext';
import { showDemoHints } from '@/lib/env';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const authStyles = useAuthStyles();
  const setAuth = usePlayerStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await rawFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.success && res.data) {
        await setAuth(
          { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
          res.data.user,
        );
        router.back();
      } else {
        setError(res.error?.message || 'خطا در ورود');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="ورود به حساب"
      subtitle="پادکست · کتاب صوتی · ویدیو"
      footerText="حساب ندارید؟"
      footerLinkText="ثبت‌نام"
      footerHref="/register"
    >
      {showDemoHints ? (
        <Text style={authStyles.hint}>demo: user@castaminofen.ir / password123</Text>
      ) : null}
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
        accessibilityHint="آدرس ایمیل حساب کاربری"
      />
      <TextInput
        style={authStyles.input}
        placeholder="رمز عبور"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textAlign="right"
        accessibilityLabel="رمز عبور"
      />
      {error ? <Text style={authStyles.error} accessibilityRole="alert">{error}</Text> : null}
      <TouchableOpacity
        style={[authStyles.btn, loading && authStyles.btnDisabled]}
        onPress={login}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'در حال ورود' : 'ورود به حساب'}
        accessibilityState={{ disabled: loading, busy: loading }}
      >
        <Text style={authStyles.btnText}>{loading ? 'در حال ورود...' : 'ورود'}</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}
