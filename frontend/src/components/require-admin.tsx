import { type ReactNode } from 'react'
import { useIsAdmin } from '@/hooks/use-account'
import { useMe } from '@/hooks/use-account'
import { EmptyState, Icon, SkeletonCard } from '@/components/ui'

/**
 * Wrapper que renderiza el contenido solo si el usuario actual es ADMIN.
 * Para SELLER muestra un mensaje de "solo para administradores".
 *
 * Esto es un fallback de seguridad — el sidebar ya oculta las entradas,
 * pero un SELLER podría llegar por URL directa.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useMe()
  const isAdmin = useIsAdmin()

  if (isLoading || !me) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <SkeletonCard />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={<Icon.Lock className="h-6 w-6" />}
          title="Solo para administradores"
          description="Esta sección contiene información sensible del negocio. Pídele al dueño o a un administrador que te dé acceso si lo necesitas."
        />
      </div>
    )
  }

  return <>{children}</>
}
