import { useState } from 'react'
import {
  Button,
  Card,
  EmptyState,
  Icon,
  SkeletonRows,
  useToast
} from '@/components/ui'
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService
} from '@/hooks/use-services'
import { useIsAdmin } from '@/hooks/use-account'
import ServiceForm from '@/components/service-form'
import { cn, formatCop } from '@/lib/utils'
import type { Service, CreateServiceRequest } from '@/types/service'

export default function ServicesPage() {
  const toast = useToast()
  const isAdmin = useIsAdmin()
  const { data: services, isLoading, isError } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const handleCreate = (data: CreateServiceRequest) => {
    createService.mutate(data, {
      onSuccess: () => { toast.success('Servicio creado', data.name); setShowForm(false) },
      onError: () => toast.error('No se pudo crear el servicio')
    })
  }

  const handleUpdate = (data: CreateServiceRequest) => {
    if (!editing) return
    updateService.mutate({ id: editing.id, data }, {
      onSuccess: () => { toast.success('Servicio actualizado'); setEditing(null); setShowForm(false) },
      onError: () => toast.error('No se pudo actualizar')
    })
  }

  const handleDelete = (s: Service) => {
    if (!confirm(`¿Eliminar "${s.name}"?`)) return
    deleteService.mutate(s.id, {
      onSuccess: () => toast.success('Servicio eliminado'),
      onError: () => toast.error('No se pudo eliminar')
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl transition-colors">
            Servicios
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {services?.length ?? 0} servicios en catálogo
          </p>
        </div>
        {!showForm && isAdmin && (
          <Button
            onClick={() => { setEditing(null); setShowForm(true) }}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Nuevo servicio
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6 animate-fade-in dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white transition-colors">
            {editing ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <ServiceForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setEditing(null); setShowForm(false) }}
            loading={createService.isPending || updateService.isPending}
          />
        </Card>
      )}

      {isLoading && (
        <Card padding="sm" className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <SkeletonRows rows={4} cols={4} />
        </Card>
      )}

      {isError && (
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="Error al cargar servicios"
        />
      )}

      {!isLoading && !isError && (services?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Icon.Scissors className="h-6 w-6" />}
          title="Aún no tienes servicios"
          description="Agrega los servicios que ofreces para poder agendar citas y venderlos."
          action={
            <Button onClick={() => setShowForm(true)} leftIcon={<Icon.Plus className="h-4 w-4" />}>
              Agregar primer servicio
            </Button>
          }
        />
      )}

      {!isLoading && !isError && (services?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services!.map(s => (
            <Card 
              key={s.id} 
              className="flex flex-col gap-3 transition-all hover:shadow-soft-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-12 w-12 flex-shrink-0 rounded-xl opacity-90"
                  style={{ backgroundColor: s.color }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-800 dark:text-slate-200 transition-colors">{s.name}</h3>
                  {s.description && (
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 transition-colors">{s.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 transition-colors">
                  <Icon.Clock className="h-4 w-4" />
                  <span>{s.durationMinutes} min</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-white tabular-nums transition-colors">
                  {formatCop(s.price)}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-1 border-t border-slate-100 dark:border-slate-800 pt-2 transition-colors">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditing(s); setShowForm(true) }}
                    leftIcon={<Icon.Edit className="h-3.5 w-3.5" />}
                    fullWidth
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(s)}
                    leftIcon={<Icon.Trash className="h-3.5 w-3.5" />}
                    className="hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-400"
                  >
                    Quitar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}