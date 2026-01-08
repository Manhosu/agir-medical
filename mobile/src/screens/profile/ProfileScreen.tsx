import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore, themes } from '../../stores/themeStore'
import { ThemeToggle } from '../../components/ThemeToggle'

export default function ProfileScreen() {
  const { user, profile, hasActiveSubscription, signOut, updateProfile } =
    useAuthStore()
  const { mode } = useThemeStore()
  const colors = themes[mode]
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      setIsEditing(false)
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso')
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ])
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name || 'Usuario'}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <View
          style={[
            styles.badge,
            hasActiveSubscription ? styles.badgeActive : styles.badgeInactive,
          ]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {hasActiveSubscription ? 'Assinante' : 'Sem Assinatura'}
          </Text>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informacoes Pessoais</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editButton, { color: colors.primary }]}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Nome</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.full_name || 'Nao informado'}
              </Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Email</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{user?.email}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Telefone</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.phone || 'Nao informado'}
              </Text>
            )}
          </View>

          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.input }]}
                onPress={() => {
                  setIsEditing(false)
                  setFullName(profile?.full_name || '')
                  setPhone(profile?.phone || '')
                }}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <ThemeToggle />
          </View>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Conta</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <Text style={styles.actionItemText}>Sair da Conta</Text>
            <Text style={[styles.actionItemIcon, { color: colors.textMuted }]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>AGIR - E-Learning Medico</Text>
        <Text style={[styles.footerVersion, { color: colors.textMuted }]}>Versao 1.0.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FAFAFA',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FAFAFA',
  },
  email: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  editButton: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  field: {
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#FAFAFA',
  },
  input: {
    fontSize: 16,
    color: '#FAFAFA',
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
  },
  editActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionItemText: {
    fontSize: 16,
    color: '#EF4444',
  },
  actionItemIcon: {
    fontSize: 16,
    color: '#71717A',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#71717A',
  },
  footerVersion: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 4,
  },
})
