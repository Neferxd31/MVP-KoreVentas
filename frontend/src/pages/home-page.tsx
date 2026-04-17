import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Health = {
  status: string
  service: string
  timestamp: string
}

// Definimos la estructura de datos que nos enviará el backend
type DashboardResumen = {
  ventasDia: number
  ventasMes: number
  ventasTotales: number
  ordenesHoy: number
}

export default function HomePage() {
  // Estado de salud del sistema
  const { data: healthData, isLoading: isHealthLoading, isError: isHealthError } = useQuery<Health>({
    queryKey: ['health'],
    queryFn: async () => (await api.get<Health>('/health')).data
  })

  // Consulta al backend para obtener las métricas del dashboard
  const { data: resumen, isLoading: isResumenLoading } = useQuery<DashboardResumen>({
    queryKey: ['dashboard-resumen'],
    queryFn: async () => (await api.get<DashboardResumen>('/sales/resumen')).data
  })

  // Función auxiliar para formatear valores a moneda (Pesos)
  const formatearMoneda = (valor: number | undefined) => {
    if (valor === undefined) return '$0'
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(valor)
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Encabezado Principal */}
      <h1 className="text-2xl font-bold text-slate-800">KoreVentas</h1>
      <p className="text-slate-500 mt-1">Panel del negocio</p>

      {/* Tarjeta de Estado del Sistema */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Estado del sistema
        </h2>
        {isHealthLoading && <p className="mt-2 text-slate-500">Consultando...</p>}
        {isHealthError && (
          <p className="mt-2 text-red-600">
            No se pudo conectar con el backend.
          </p>
        )}
        {healthData && (
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-sm text-slate-700">Backend conectado</span>
          </div>
        )}
      </div>

      {/* Sección: Dashboard / Resumen */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Resumen</h2>
        
        {isResumenLoading ? (
          <p className="text-slate-500 animate-pulse">Cargando métricas...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Tarjeta 1: Ventas del día */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Ventas del día</h3>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {formatearMoneda(resumen?.ventasDia)}
              </p>
            </div>

            {/* Tarjeta 2: Ventas del mes */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Ventas del mes</h3>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {formatearMoneda(resumen?.ventasMes)}
              </p>
            </div>

            {/* Tarjeta 3: Ventas totales */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Ventas totales</h3>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {formatearMoneda(resumen?.ventasTotales)}
              </p>
            </div>

            {/* Tarjeta 4: Dato adicional sugerido */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Órdenes de hoy</h3>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {resumen?.ordenesHoy || 0}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}