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
import type { AuthScreenProps } from '../../navigation/types'

export default function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>AGIR</Text>
          <Text style={styles.subtitle}>E-Learning Medico</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.description}>
            Digite seu email para receber um link de recuperacao
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#71717A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FAFAFA" />
            ) : (
              <Text style={styles.buttonText}>Enviar Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={isSubmitting}>
            <Text style={styles.footerLink}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
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
    color: '#22C55E',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FAFAFA',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FAFAFA',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  button: {
    backgroundColor: '#22C55E',
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
    color: '#FAFAFA',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
})
