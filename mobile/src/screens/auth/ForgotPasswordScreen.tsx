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
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../hooks/useTheme'
import type { AuthScreenProps } from '../../navigation/types'

export default function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const colors = useTheme()

  const { resetPassword } = useAuthStore()

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite seu email')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(email.trim().toLowerCase())
      Alert.alert(
        'Email Enviado',
        'Verifique sua caixa de entrada para redefinir sua senha.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      )
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar email')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>AGIR</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>E-Learning Medico</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Recuperar Senha</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Digite seu email para receber um link de recuperacao
          </Text>

          <View style={styles.inputGroup}>
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
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.text }]}>Enviar Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={isSubmitting}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 24,
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
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
})
