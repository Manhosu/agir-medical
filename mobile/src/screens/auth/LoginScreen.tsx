import React, { useState, useRef } from 'react'
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
  Image,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../hooks/useTheme'
import { useButtonAnimation, usePulseGlow, useFloatingAnimation } from '../../hooks/useAnimations'
import type { AuthScreenProps } from '../../navigation/types'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const colors = useTheme()
  const otpInputRef = useRef<TextInput>(null)

  const { sendOtp, verifyOtp } = useAuthStore()
  const { animatedStyle: buttonStyle, onPressIn, onPressOut } = useButtonAnimation()
  const pulseStyle = usePulseGlow()
  const floatingStyle = useFloatingAnimation(8, 4000)

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite seu email')
      return
    }

    setIsSubmitting(true)

    try {
      await sendOtp(email.trim().toLowerCase())
      setStep('otp')
      Alert.alert(
        'Codigo Enviado',
        'Enviamos um codigo de 6 digitos para seu email. Verifique tambem a pasta de spam.',
      )
      setTimeout(() => otpInputRef.current?.focus(), 500)
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Erro ao enviar codigo. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Erro', 'Digite o codigo de 6 digitos')
      return
    }

    setIsSubmitting(true)

    try {
      await verifyOtp(email.trim().toLowerCase(), otpCode)
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.message === 'Token has expired or is invalid'
          ? 'Codigo invalido ou expirado. Tente novamente.'
          : error.message || 'Erro ao verificar codigo',
      )
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
          <Animated.View style={pulseStyle}>
            <Image
              source={require('../../../assets/logo-circular-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        <Animated.View
          entering={SlideInUp.delay(200).duration(500).springify()}
          style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Animated.Text
            entering={FadeIn.delay(400).duration(400)}
            style={[styles.title, { color: colors.text }]}
          >
            {step === 'email' ? 'Entrar' : 'Verificar Codigo'}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(500).duration(400)}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {step === 'email'
              ? 'Digite seu email para receber um codigo de acesso'
              : `Enviamos um codigo para ${email}`}
          </Animated.Text>

          {step === 'email' ? (
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
                accessibilityLabel="Campo de email"
                accessibilityHint="Digite seu email para receber o codigo de acesso"
              />
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(100).duration(400)}
              style={styles.inputGroup}
            >
              <Text style={[styles.label, { color: colors.text }]}>Codigo de Acesso</Text>
              <TextInput
                ref={otpInputRef}
                style={[styles.otpInput, { backgroundColor: colors.border, color: colors.text, borderColor: colors.textTertiary }]}
                placeholder="000000"
                placeholderTextColor={colors.textTertiary}
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isSubmitting}
                accessibilityLabel="Campo de codigo OTP"
                accessibilityHint="Digite o codigo de 6 digitos enviado para seu email"
              />
            </Animated.View>
          )}

          <AnimatedTouchable
            entering={FadeInUp.delay(step === 'email' ? 700 : 200).duration(500).springify()}
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isSubmitting && styles.buttonDisabled,
              buttonStyle,
            ]}
            onPress={step === 'email' ? handleSendOtp : handleVerifyOtp}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={step === 'email' ? 'Enviar codigo' : 'Verificar codigo'}
            accessibilityHint={step === 'email' ? 'Toque para enviar o codigo de acesso' : 'Toque para verificar o codigo'}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                {step === 'email' ? 'Enviar Codigo de Acesso' : 'Verificar Codigo'}
              </Text>
            )}
          </AnimatedTouchable>

          {step === 'otp' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.otpActions}>
              <TouchableOpacity
                onPress={() => {
                  setStep('email')
                  setOtpCode('')
                }}
                disabled={isSubmitting}>
                <Text style={[styles.otpActionText, { color: colors.primary }]}>Usar outro email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={isSubmitting}>
                <Text style={[styles.otpActionText, { color: colors.primary }]}>Reenviar codigo</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(step === 'email' ? 1000 : 400).duration(500)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Nao tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            accessibilityHint="Toque para criar uma nova conta">
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
  logoImage: {
    width: 140,
    height: 140,
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
  otpInput: {
    borderRadius: 8,
    padding: 16,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 12,
    textAlign: 'center',
    borderWidth: 1,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  otpActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#02884a',
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
