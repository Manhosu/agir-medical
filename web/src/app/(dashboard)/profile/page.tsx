'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { profile, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Avatar Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Foto de Perfil</CardTitle>
          <CardDescription>
            Sua foto será exibida no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" disabled>
              Alterar Foto
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou GIF. Máximo 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">Informações Pessoais</CardTitle>
              <CardDescription>
                Seus dados cadastrais
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={isEditing ? formData.full_name : (profile?.full_name || '')}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={isEditing ? formData.cpf : (profile?.cpf || '')}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={isEditing ? formData.phone : (profile?.phone || '')}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="(00) 00000-0000"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    cpf: profile?.cpf || '',
                  })
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Informações da Conta</CardTitle>
          <CardDescription>
            Dados da sua conta e assinatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Tipo de conta</span>
            <span className="font-medium">
              {profile?.role === 'admin' ? 'Administrador' : 'Assinante'}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Membro desde</span>
            <span className="font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
