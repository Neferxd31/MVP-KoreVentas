import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Icon,
  ImageUploader,
  Input,
  SkeletonCard,
  useToast
} from '@/components/ui'
import {
  useMe,
  useUpdateProfile,
  useChangePassword
} from '@/hooks/use-account'
import { useAuth } from '@/hooks/use-auth'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  SELLER: 'Vendedor'
}

export default function AccountPage() {
  const toast = useToast()
  const { logout } = useAuth()
  const { data: me, isLoading } = useMe()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  // Perfil
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Seguridad
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  useEffect(() => {
    if (!me) return
    setFullName(me.fullName)
    setEmail(me.email)
    setAvatarUrl(me.avatarUrl)
  }, [me])

  const handleSaveProfile = () => {
    if (!fullName.trim()) { toast.error('El nombre no puede estar vacío'); return }
    if (!email.trim()) { toast.error('El correo no puede estar vacío'); return }
    updateProfile.mutate(
      { fullName: fullName.trim(), email: email.trim(), avatarUrl },
      {
        onSuccess: () => toast.success('Perfil actualizado'),
        onError: (e: any) => toast.error('No se pudo guardar', e?.response?.data?.message ?? '')
      }
    )
  }

  const handleChangePassword = () => {
    if (!currentPwd) { toast.error('Ingresa tu contraseña actual'); return }
    if (newPwd.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return }
    if (newPwd !== confirmPwd) { toast.error('Las contraseñas no coinciden'); return }
    changePassword.mutate(
      { currentPassword: currentPwd, newPassword: newPwd },
      {
        onSuccess: () => {
          toast.success('Contraseña actualizada')
          setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        },
        onError: (e: any) => {
          const msg = e?.response?.data?.message ?? 'Verifica tu contraseña actual'
          toast.error('No se pudo cambiar', msg)
        }
      }
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tus datos personales y seguridad. Solo tú puedes verlos y editarlos.
        </p>
      </div>

      {isLoading && <SkeletonCard />}

      {me && (
        <>
          {/* Perfil */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                  <Icon.UserCheck className="h-5 w-5" />
                </div>
              }
              title="Perfil"
              subtitle="Cómo te ven en la aplicación."
              action={<Badge tone={me.role === 'ADMIN' ? 'purple' : 'info'}>{ROLE_LABEL[me.role]}</Badge>}
            />
            <div className="mt-5 space-y-4">
              <ImageUploader
                label="Foto de perfil"
                value={avatarUrl}
                onChange={setAvatarUrl}
                hint="Aparecerá junto a tu nombre en la barra lateral."
                sizeClass="h-20 w-20"
              />
              <Input
                label="Nombre completo"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                hint="Se usa para iniciar sesión."
              />
              <div className="text-xs text-slate-500">
                Cuenta creada el{' '}
                {new Date(me.createdAt).toLocaleDateString('es-CO', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleSaveProfile} loading={updateProfile.isPending}>
                Guardar cambios
              </Button>
            </div>
          </Card>

          {/* Seguridad */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-700 ring-4 ring-warning-100">
                  <Icon.Lock className="h-5 w-5" />
                </div>
              }
              title="Cambiar contraseña"
              subtitle="Mínimo 6 caracteres. Te pedimos la actual para confirmar."
            />
            <div className="mt-5 space-y-3">
              <Input
                type="password"
                label="Contraseña actual"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                type="password"
                label="Nueva contraseña"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                type="password"
                label="Confirma la nueva contraseña"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleChangePassword}
                loading={changePassword.isPending}
                disabled={!currentPwd || !newPwd || !confirmPwd}
              >
                Actualizar contraseña
              </Button>
            </div>
          </Card>

          {/* Sesión */}
          <Card>
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-600 ring-4 ring-danger-100">
                  <Icon.LogOut className="h-5 w-5" />
                </div>
              }
              title="Cerrar sesión"
              subtitle="Saldrás del sistema en este dispositivo."
            />
            <div className="mt-5 flex justify-end">
              <Button variant="danger" onClick={logout} leftIcon={<Icon.LogOut className="h-4 w-4" />}>
                Cerrar sesión
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
