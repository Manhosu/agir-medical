import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../hooks/useTheme'
import { useButtonAnimation, usePulseGlow, useFloatingAnimation } from '../../hooks/useAnimations'
import type { AuthScreenProps } from '../../navigation/types'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const colors = useTheme()

  const { signIn } = useAuthStore()
  const { animatedStyle: buttonStyle, onPressIn, onPressOut } = useButtonAnimation()
  const pulseStyle = usePulseGlow()
  const floatingStyle = useFloatingAnimation(8, 4000)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }

    setIsSubmitting(true)

    try {
      await signIn(email.trim().toLowerCase(), password)
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message || 'Erro ao fazer login',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Background Glow Effects */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrb1,
          { backgroundColor: colors.primary },
          floatingStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrb2,
          { backgroundColor: colors.accent },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.header}
        >
          <Animated.Text style={[styles.logo, { color: colors.primary }, pulseStyle]}>
            AGIR
          </Animated.Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>E-Learning Medico</Text>
        </Animated.View>

        <Animated.View
          entering={SlideInUp.delay(200).duration(500).springify()}
          style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Animated.Text
            entering={FadeIn.delay(400).duration(400)}
            style={[styles.title, { color: colors.text }]}
          >
            Entrar
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(500).duration(400)}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            Acesse sua conta para continuar seus estudos
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.inputGroup}
          >
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.border, color: colors.text, borderColor: colors.textTertiary }]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isSubmitting}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(700).duration(400)}
            style={styles.inputGroup}
          >
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.border, color: colors.text, borderColor: colors.textTertiary }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(800).duration(400)}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isSubmitting}>
              <Text style={[styles.forgotPassword, { color: colors.primary }]}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </Animated.View>

          <AnimatedTouchable
            entering={FadeInUp.delay(900).duration(500).springify()}
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isSubmitting && styles.buttonDisabled,
              buttonStyle,
            ]}
            onPress={handleLogin}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Entrar</Text>
            )}
          </AnimatedTouchable>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1000).duration(500)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Nao tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isSubmitting}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Criar conta</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  glowOrb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  glowOrb2: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  forgotPassword: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1ae8cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
})
