'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function ProfilePage() {
  const { profile, user, hasActiveSubscription, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })

  // Avatar upload states
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [isUploading, setIsUploading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }

  // Set initial crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const cropSize = Math.min(width, height)
    const crop = centerCrop(
      makeAspectCrop({ unit: 'px', width: cropSize }, 1, width, height),
      width,
      height
    )
    setCrop(crop)
  }, [])

  // Get cropped image blob
  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imgRef.current || !crop) return null

    const canvas = document.createElement('canvas')
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    canvas.width = 200
    canvas.height = 200

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      200,
      200
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    })
  }

  // Upload cropped image
  const handleUploadAvatar = async () => {
    if (!user?.id) return

    setIsUploading(true)
    try {
      const blob = await getCroppedImg()
      if (!blob) {
        toast.error('Erro ao processar imagem')
        return
      }

      const fileName = `${user.id}-${Date.now()}.jpg`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile
      await updateProfile({ avatar_url: publicUrl })

      toast.success('Foto atualizada com sucesso!')
      setShowCropModal(false)
      setImageSrc(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Erro ao fazer upload da foto')
    } finally {
      setIsUploading(false)
    }
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
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
            <span className={`font-medium ${hasActiveSubscription ? 'text-green-600' : 'text-muted-foreground'}`}>
              {profile?.role === 'admin' ? 'Administrador' : (hasActiveSubscription ? 'Assinante' : 'Sem Assinatura')}
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

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Foto</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCropModal(false)
                setImageSrc(null)
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUploadAvatar} disabled={isUploading}>
              {isUploading ? 'Salvando...' : 'Salvar Foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
