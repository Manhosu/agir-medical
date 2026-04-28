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
  Image,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore, themes } from '../../stores/themeStore'
import { ThemeToggle } from '../../components/ThemeToggle'
import { supabase } from '../../lib/supabase'
import { useButtonAnimation, useCardAnimation, useFloatingAnimation } from '../../hooks/useAnimations'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function ProfileScreen() {
  const { user, profile, hasActiveSubscription, signOut, updateProfile } =
    useAuthStore()
  const { mode } = useThemeStore()
  const colors = themes[mode]
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const { animatedStyle: saveButtonStyle, onPressIn: onSavePressIn, onPressOut: onSavePressOut } = useButtonAnimation()
  const { animatedStyle: cardStyle, onPressIn: onCardPressIn, onPressOut: onCardPressOut } = useCardAnimation()
  const floatingStyle = useFloatingAnimation(6, 3500)

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma foto.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri)
    }
  }

  const uploadAvatar = async (uri: string) => {
    if (!user?.id) return

    setIsUploadingAvatar(true)
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )

      const fileName = `${user.id}-${Date.now()}.jpg`

      // Ler arquivo como blob via XMLHttpRequest (mais confiavel no React Native)
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = () => resolve(xhr.response)
        xhr.onerror = () => reject(new Error('Erro ao ler imagem'))
        xhr.responseType = 'blob'
        xhr.open('GET', manipulated.uri, true)
        xhr.send(null)
      })

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/jpeg',
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await updateProfile({ avatar_url: publicUrl })
      Alert.alert('Sucesso', 'Foto atualizada com sucesso!')
    } catch (error: any) {
      console.error('Upload error:', error)
      Alert.alert('Erro', error.message || 'Erro ao fazer upload da foto')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

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

      {/* Profile Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isUploadingAvatar}
          accessibilityRole="button"
          accessibilityLabel="Foto de perfil"
          accessibilityHint="Toque para alterar sua foto de perfil">
          {profile?.avatar_url ? (
            <Animated.Image
              entering={FadeIn.delay(200).duration(400)}
              source={{ uri: profile.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={[styles.avatar, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </Text>
            </Animated.View>
          )}
          {isUploadingAvatar && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Animated.View entering={FadeIn.delay(300).duration(400)}>
          <TouchableOpacity onPress={handlePickImage} disabled={isUploadingAvatar}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {isUploadingAvatar ? 'Enviando...' : 'Alterar Foto'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(400)}
          style={[styles.name, { color: colors.text }]}
        >
          {profile?.full_name || 'Usuário'}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(500).duration(400)}
          style={[styles.email, { color: colors.textSecondary }]}
        >
          {user?.email}
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(600).duration(400).springify()}
          style={[
            styles.badge,
            hasActiveSubscription ? styles.badgeActive : styles.badgeInactive,
          ]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {hasActiveSubscription ? 'Conta Ativa' : 'Conta Inativa'}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Profile Info */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações Pessoais</Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil">
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
                accessibilityLabel="Nome completo"
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.full_name || 'Não informado'}
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
                accessibilityLabel="Telefone"
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.phone || 'Não informado'}
              </Text>
            )}
          </View>

          {isEditing && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.editActions}
            >
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.input }]}
                onPress={() => {
                  setIsEditing(false)
                  setFullName(profile?.full_name || '')
                  setPhone(profile?.phone || '')
                }}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <AnimatedTouchable
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                  isSaving && styles.buttonDisabled,
                  saveButtonStyle,
                ]}
                onPress={handleSave}
                onPressIn={onSavePressIn}
                onPressOut={onSavePressOut}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>Salvar</Text>
                )}
              </AnimatedTouchable>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Preferences */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferências</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <ThemeToggle />
          </View>
        </View>
      </Animated.View>

      {/* Account Actions */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(500)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Conta</Text>
        <AnimatedTouchable
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}
          onPress={handleLogout}
          onPressIn={onCardPressIn}
          onPressOut={onCardPressOut}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          accessibilityHint="Toque para desconectar da sua conta"
        >
          <View style={styles.actionItem}>
            <Text style={[styles.actionItemText, { color: colors.destructive }]}>Sair da Conta</Text>
            <Text style={[styles.actionItemIcon, { color: colors.textMuted }]}>→</Text>
          </View>
        </AnimatedTouchable>
      </Animated.View>

      {/* App Info */}
      <Animated.View
        entering={FadeIn.delay(800).duration(500)}
        style={styles.footer}
      >
        <Image
          source={require('../../../assets/logo-horizontal-white.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <Text style={[styles.footerVersion, { color: colors.textMuted }]}>Versão 1.0.0</Text>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  glowOrb1: {
    width: 250,
    height: 250,
    top: -50,
    right: -80,
  },
  glowOrb2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  field: {
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
  },
  editActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
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
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionItemText: {
    fontSize: 16,
  },
  actionItemIcon: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  footerLogo: {
    width: 160,
    height: 45,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    marginTop: 4,
  },
})
