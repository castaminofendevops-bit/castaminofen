import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold } from '@expo-google-fonts/vazirmatn';
import { AuthProvider } from '@/components/AuthProvider';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { fonts } from '@/constants/theme';

function applyDefaultFont() {
  type WithDefaultProps = { defaultProps?: { style?: object | object[] } };
  const TextComponent = Text as typeof Text & WithDefaultProps;
  const TextInputComponent = TextInput as typeof TextInput & WithDefaultProps;
  TextComponent.defaultProps = {
    ...TextComponent.defaultProps,
    style: { fontFamily: fonts.regular },
  };
  TextInputComponent.defaultProps = {
    ...TextInputComponent.defaultProps,
    style: { fontFamily: fonts.regular },
  };
}

function RootNavigator() {
  const { colors, mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgSecondary },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700', fontFamily: fonts.bold },
          headerBackTitle: 'بازگشت',
          contentStyle: { backgroundColor: colors.bgPrimary },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="content/[id]"
          options={{
            title: 'محتوا',
            headerShown: true,
            animation: 'slide_from_left',
          }}
        />
        <Stack.Screen name="video/[id]" options={{ title: 'ویدیو', headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="login" options={{ title: 'ورود', presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'ثبت‌نام', presentation: 'modal', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
  });

  useEffect(() => {
    if (loaded) applyDefaultFont();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
        <OnboardingModal />
      </AuthProvider>
    </ThemeProvider>
  );
}
