import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import LoginPage from './pages/login-page'
import ProductsPage from './pages/products-page'
import CustomersPage from './pages/customers-page'
import PosPage from './pages/pos-page'
import HomePage from './pages/home-page'

const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/pos', label: 'Vender' },
  { path: '/products', label: 'Productos' },
  { path: '/customers', label: 'Clientes' }
]

export default function App() {
  const location = useLocation()
  const { isAuthenticated, loading, error, login, register, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={async (data) => { await login(data) }}
        onRegister={async (data) => { await register(data) }}
        loading={loading}
        error={error}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <Link to="/" className="text-lg font-bold text-blue-600">KoreVentas</Link>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="ml-4 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
      </Routes>
    </div>
  )
}
