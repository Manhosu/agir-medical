'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { updatePassword } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    progressReminders: true,
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsChangingPassword(true)

    try {
      await updatePassword(passwordData.newPassword)
      toast.success('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e segurança
        </p>
      </div>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Alterar Senha</CardTitle>
          <CardDescription>
            Atualize sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Preferências</CardTitle>
          <CardDescription>
            Personalize sua experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Ativar tema escuro para leitura
              </p>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, darkMode: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber atualizações sobre novos conteúdos
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembretes de Estudo</Label>
              <p className="text-sm text-muted-foreground">
                Receber lembretes para continuar seus estudos
              </p>
            </div>
            <Switch
              checked={preferences.progressReminders}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, progressReminders: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="font-serif text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Excluir Conta</p>
              <p className="text-sm text-muted-foreground">
                Remover permanentemente sua conta e todos os dados
              </p>
            </div>
            <Button variant="destructive" disabled>
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
