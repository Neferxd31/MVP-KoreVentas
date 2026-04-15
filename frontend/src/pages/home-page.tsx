import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Health = {
  status: string
  service: string
  timestamp: string
}

export default function HomePage() {
  const { data, isLoading, isError } = useQuery<Health>({
    queryKey: ['health'],
    queryFn: async () => (await api.get<Health>('/health')).data
  })

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-slate-800">KoreVentas</h1>
      <p className="text-slate-500 mt-1">Panel del negocio</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Estado del sistema
        </h2>
        {isLoading && <p className="mt-2 text-slate-500">Consultando...</p>}
        {isError && (
          <p className="mt-2 text-red-600">
            No se pudo conectar con el backend.
          </p>
        )}
        {data && (
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-sm text-slate-700">Backend conectado</span>
          </div>
        )}
      </div>
    </div>
  )
}
