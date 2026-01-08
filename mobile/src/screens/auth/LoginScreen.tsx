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

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const colors = useTheme()

  const { signIn } = useAuthStore()

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>AGIR</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>E-Learning Medico</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Entrar</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Acesse sua conta para continuar seus estudos
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

          <View style={styles.inputGroup}>
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
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isSubmitting}>
            <Text style={[styles.forgotPassword, { color: colors.primary }]}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.text }]}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Nao tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isSubmitting}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Criar conta</Text>
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
