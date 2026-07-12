import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { EnvelopeSimple, Lock, Eye, EyeSlash } from 'phosphor-react-native';
import { useSignIn } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!isLoaded) return;
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        // If MFA is required or email is unverified, Clerk stops here.
        console.error('Sign in not complete: ', signInAttempt);
        setError(`Sign in requires additional steps. Status: ${signInAttempt.status}. If your email is unverified, please sign up again.`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to login. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue managing your expenses</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <EnvelopeSimple size={20} color={theme.colors.onSurfaceTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={theme.colors.onSurfaceTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.onSurfaceTertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeSlash size={20} color={theme.colors.onSurfaceTertiary} />
                ) : (
                  <Eye size={20} color={theme.colors.onSurfaceTertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: -8 }} onPress={() => router.push('/forgot-password')}>
            <Text style={{ color: theme.colors.brandSecondary, fontFamily: theme.typography.mediumFontFamily }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onBrandPrimary} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing['3xl'],
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.displayFontFamily,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurfaceSecondary,
  },
  errorBox: {
    backgroundColor: `${theme.colors.expense}15`,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.expense,
    fontFamily: theme.typography.mediumFontFamily,
    fontSize: theme.typography.scale.sm,
  },
  form: {
    gap: theme.spacing.xl,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.onSurfaceSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 56,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurface,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: theme.colors.brandPrimary,
    fontFamily: theme.typography.semiBoldFontFamily,
    fontSize: theme.typography.scale.sm,
  },
  loginBtn: {
    backgroundColor: theme.colors.brandPrimary,
    height: 56,
    borderRadius: theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.tier1,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: theme.colors.onBrandPrimary,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing['3xl'],
  },
  footerText: {
    color: theme.colors.onSurfaceSecondary,
    fontFamily: theme.typography.textFontFamily,
  },
  signupText: {
    color: theme.colors.brandPrimary,
    fontFamily: theme.typography.semiBoldFontFamily,
  },
});
