import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  SkeletonCard,
  useToast
} from '@/components/ui'
import { useMe } from '@/hooks/use-account'
import {
  useTeam,
  useInviteMember,
  useUpdateMember,
  useDeactivateMember
} from '@/hooks/use-team'
import { cn } from '@/lib/utils'
import type { Account, InviteResponse, UserRole } from '@/types/account'

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  SELLER: 'Vendedor'
}

export default function TeamPage() {
  const toast = useToast()
  const { data: me } = useMe()
  const { data: team, isLoading } = useTeam()
  const invite = useInviteMember()
  const update = useUpdateMember()
  const deactivate = useDeactivateMember()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('SELLER')
  const [lastInvite, setLastInvite] = useState<InviteResponse | null>(null)

  // Si no es admin, bloqueamos la página
  if (me && me.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={<Icon.Lock className="h-6 w-6" />}
          title="Solo para administradores"
          description="Esta sección permite gestionar el equipo. Solo los administradores del negocio tienen acceso."
        />
      </div>
    )
  }

  const handleInvite = () => {
    if (!newName.trim()) { toast.error('Ingresa el nombre'); return }
    if (!newEmail.trim()) { toast.error('Ingresa el correo'); return }
    invite.mutate(
      { fullName: newName.trim(), email: newEmail.trim(), role: newRole },
      {
        onSuccess: data => {
          setLastInvite(data)
          toast.success('Usuario creado', `Contraseña temporal generada`)
          setNewName('')
          setNewEmail('')
          setNewRole('SELLER')
          setShowForm(false)
        },
        onError: (e: any) => {
          const msg = e?.response?.data?.message ?? 'Verifica los datos'
          toast.error('No se pudo crear', msg)
        }
      }
    )
  }

  const handleChangeRole = (member: Account, role: UserRole) => {
    if (member.role === role) return
    update.mutate(
      { id: member.id, data: { role } },
      {
        onSuccess: () => toast.success('Rol actualizado'),
        onError: (e: any) => toast.error('No se pudo cambiar', e?.response?.data?.message ?? '')
      }
    )
  }

  const handleToggleEnabled = (member: Account) => {
    if (member.enabled) {
      if (!confirm(`¿Desactivar a ${member.fullName}? No podrá iniciar sesión.`)) return
      deactivate.mutate(member.id, {
        onSuccess: () => toast.success('Usuario desactivado'),
        onError: (e: any) => toast.error('No se pudo desactivar', e?.response?.data?.message ?? '')
      })
    } else {
      update.mutate(
        { id: member.id, data: { enabled: true } },
        {
          onSuccess: () => toast.success('Usuario reactivado'),
          onError: () => toast.error('No se pudo reactivar')
        }
      )
    }
  }

  const copyTempPassword = () => {
    if (!lastInvite) return
    navigator.clipboard.writeText(lastInvite.temporaryPassword)
    toast.info('Copiada al portapapeles')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl transition-colors">
            Equipo
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {team?.length ?? 0} miembros en tu negocio.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Invitar miembro
          </Button>
        )}
      </div>

      {/* Resultado de invitación: contraseña temporal */}
      {lastInvite && (
        <Card className="mb-6 border-success-300 bg-success-50/40 dark:border-success-900/50 dark:bg-success-900/10 transition-colors">
          <CardHeader
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-700 ring-4 ring-success-50 dark:bg-success-900/30 dark:text-success-400 dark:ring-success-900/50 transition-colors">
                <Icon.Check className="h-5 w-5" />
              </div>
            }
            title={<span className="text-slate-800 dark:text-slate-200">{lastInvite.user.fullName} ya tiene acceso</span>}
            subtitle={<span className="text-slate-600 dark:text-slate-400">Comparte esta contraseña temporal — solo se muestra una vez.</span>}
            action={
              <button
                onClick={() => setLastInvite(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <Icon.X className="h-4 w-4" />
              </button>
            }
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-800/50 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo</p>
              <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all transition-colors">{lastInvite.user.email}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-800/50 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Contraseña temporal
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="flex-1 font-mono text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider transition-colors">
                  {lastInvite.temporaryPassword}
                </p>
                <button
                  onClick={copyTempPassword}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                  title="Copiar"
                >
                  <Icon.Receipt className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 transition-colors">
            Recomienda al nuevo miembro cambiarla apenas inicie sesión, en <strong className="dark:text-slate-300">Mi cuenta → Cambiar contraseña</strong>.
          </p>
        </Card>
      )}

      {/* Formulario de invitación */}
      {showForm && (
        <Card className="mb-6 animate-fade-in dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <CardHeader
            title={<span className="text-slate-800 dark:text-white">Invitar nuevo miembro</span>}
            subtitle={<span className="text-slate-500 dark:text-slate-400">Generamos una contraseña temporal que se la entregas tú.</span>}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Input
              label="Nombre completo"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ej: Carlos Pérez"
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="carlos@negocio.com"
            />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Rol</label>
              <div className="grid grid-cols-2 gap-2">
                {(['ADMIN', 'SELLER'] as UserRole[]).map(r => {
                  const active = newRole === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={cn(
                        'rounded-xl border-2 p-3 text-left text-sm transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                      )}
                    >
                      <p className={cn(
                        'font-semibold transition-colors',
                        active ? 'text-brand-700 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'
                      )}>
                        {ROLE_LABEL[r]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                        {r === 'ADMIN'
                          ? 'Acceso total + gestión del equipo'
                          : 'Vender y gestionar inventario'}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleInvite} loading={invite.isPending}>
              Crear cuenta
            </Button>
          </div>
        </Card>
      )}

      {/* Lista del equipo */}
      {isLoading && <SkeletonCard />}

      {team && team.length > 0 && (
        <div className="space-y-2">
          {team.map(member => {
            const isMe = member.id === me?.id
            return (
              <Card key={member.id} padding="sm" className={cn(
                'dark:bg-slate-900 dark:border-slate-800 transition-colors',
                !member.enabled && 'opacity-60 grayscale-[50%]'
              )}>
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                        {member.fullName}
                      </p>
                      {isMe && <Badge tone="info" size="sm">Tú</Badge>}
                      {!member.enabled && <Badge tone="danger" size="sm">Inactivo</Badge>}
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 transition-colors">{member.email}</p>
                  </div>

                  {/* Selector rol */}
                  <select
                    value={member.role}
                    onChange={e => handleChangeRole(member, e.target.value as UserRole)}
                    disabled={!member.enabled}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="SELLER">Vendedor</option>
                  </select>

                  {/* Acciones */}
                  {!isMe && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleEnabled(member)}
                      className={member.enabled ? 'hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-400' : ''}
                    >
                      {member.enabled ? 'Desactivar' : 'Reactivar'}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {team && team.length === 0 && (
        <EmptyState
          icon={<Icon.Users className="h-6 w-6" />}
          title="Sin miembros aún"
          description="Invita a tu primer colaborador para que te ayude a gestionar el negocio."
          action={
            <Button onClick={() => setShowForm(true)} leftIcon={<Icon.Plus className="h-4 w-4" />}>
              Invitar primer miembro
            </Button>
          }
        />
      )}
    </div>
  )
}