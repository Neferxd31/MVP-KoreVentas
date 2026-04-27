import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import { AppLayout } from './components/app-layout'
import { ThemeSync } from './components/theme-sync'
import { RequireAdmin } from './components/require-admin'
import LoginPage from './pages/login-page'
import ProductsPage from './pages/products-page'
import CustomersPage from './pages/customers-page'
import PosPage from './pages/pos-page'
import HomePage from './pages/home-page'
import ServicesPage from './pages/services-page'
import EmployeesPage from './pages/employees-page'
import AgendaPage from './pages/agenda-page'
import CashPage from './pages/cash-page'
import ExpensesPage from './pages/expenses-page'
import ReportsPage from './pages/reports-page'
import SalesPage from './pages/sales-page'
import GoalsPage from './pages/goals-page'
import ReceiptPage from './pages/receipt-page'
import SettingsPage from './pages/settings-page'
import AccountPage from './pages/account-page'
import TeamPage from './pages/team-page'
import PublicCatalogPage from './pages/public-catalog-page'

export default function App() {
  const { isAuthenticated, loading, error, login, register, logout } = useAuth()
  const location = useLocation()

  // Las rutas públicas /c/:slug no requieren autenticación ni layout interno.
  // Esto permite que cualquier comprador abra el catálogo sin tener cuenta.
  const isPublicRoute = location.pathname.startsWith('/c/')
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/c/:slug" element={<PublicCatalogPage />} />
      </Routes>
    )
  }

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
    <>
      <ThemeSync />
      <AppLayout onLogout={logout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/employees" element={<RequireAdmin><EmployeesPage /></RequireAdmin>} />
          <Route path="/cash" element={<RequireAdmin><CashPage /></RequireAdmin>} />
          <Route path="/expenses" element={<RequireAdmin><ExpensesPage /></RequireAdmin>} />
          <Route path="/reports" element={<RequireAdmin><ReportsPage /></RequireAdmin>} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/goals" element={<RequireAdmin><GoalsPage /></RequireAdmin>} />
          <Route path="/settings" element={<RequireAdmin><SettingsPage /></RequireAdmin>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/team" element={<RequireAdmin><TeamPage /></RequireAdmin>} />
          <Route path="/sales/:id/receipt" element={<ReceiptPage />} />
        </Routes>
      </AppLayout>
    </>
  )
}
