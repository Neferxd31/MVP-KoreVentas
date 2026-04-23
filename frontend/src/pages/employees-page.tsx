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
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee
} from '@/hooks/use-employees'
import EmployeeForm from '@/components/employee-form'
import type { Employee, CreateEmployeeRequest } from '@/types/employee'

export default function EmployeesPage() {
  const toast = useToast()
  const { data: employees, isLoading, isError } = useEmployees()
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const deleteEmployee = useDeleteEmployee()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const handleCreate = (data: CreateEmployeeRequest) => {
    createEmployee.mutate(data, {
      onSuccess: () => { toast.success('Miembro agregado', data.fullName); setShowForm(false) },
      onError: () => toast.error('No se pudo agregar')
    })
  }

  const handleUpdate = (data: CreateEmployeeRequest) => {
    if (!editing) return
    updateEmployee.mutate({ id: editing.id, data }, {
      onSuccess: () => { toast.success('Actualizado'); setEditing(null); setShowForm(false) },
      onError: () => toast.error('No se pudo actualizar')
    })
  }

  const handleDelete = (e: Employee) => {
    if (!confirm(`¿Quitar a "${e.fullName}" del equipo?`)) return
    deleteEmployee.mutate(e.id, {
      onSuccess: () => toast.success('Miembro desactivado'),
      onError: () => toast.error('No se pudo quitar')
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Equipo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {employees?.length ?? 0} miembros activos
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => { setEditing(null); setShowForm(true) }}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Agregar al equipo
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {editing ? 'Editar miembro' : 'Nuevo miembro'}
          </h2>
          <EmployeeForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setEditing(null); setShowForm(false) }}
            loading={createEmployee.isPending || updateEmployee.isPending}
          />
        </Card>
      )}

      {isLoading && (
        <Card padding="sm">
          <SkeletonRows rows={4} cols={3} />
        </Card>
      )}

      {isError && (
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="Error al cargar el equipo"
        />
      )}

      {!isLoading && !isError && (employees?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Icon.UserCheck className="h-6 w-6" />}
          title="Aún no tienes equipo"
          description="Agrega a las personas que atienden para poder asignarles citas."
          action={
            <Button onClick={() => setShowForm(true)} leftIcon={<Icon.Plus className="h-4 w-4" />}>
              Agregar primer miembro
            </Button>
          }
        />
      )}

      {!isLoading && !isError && (employees?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees!.map(e => (
            <Card key={e.id} className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ backgroundColor: e.color }}
              >
                {e.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-800">{e.fullName}</h3>
                {e.role && <p className="truncate text-xs text-slate-500">{e.role}</p>}
                {e.phone && <p className="truncate text-xs text-slate-400">{e.phone}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditing(e); setShowForm(true) }}
                  leftIcon={<Icon.Edit className="h-3.5 w-3.5" />}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(e)}
                  leftIcon={<Icon.Trash className="h-3.5 w-3.5" />}
                  className="hover:bg-danger-50 hover:text-danger-600"
                >
                  Quitar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
