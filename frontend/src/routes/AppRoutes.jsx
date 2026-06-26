import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login.jsx'
import FullScreenSpinner from '../components/FullScreenSpinner.jsx'
import Register  from '../pages/auth/Register.jsx'
import VerifyOTP from '../pages/auth/VerifyOTP.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import VerifyResetOTP from '../pages/auth/VerifyResetOTP.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'
import Layout from '../components/Layout/Layout.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import authStore from '../store/authStore.jsx'
import Products from '../pages/ProductsPage.jsx'
import Categories from '../pages/CategoryPage.jsx'
import Suppliers from '../pages/SupplierPage.jsx'
import Orders from '../pages/OrderManagementPage.jsx'
import Transactions from '../pages/TransactionPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'
// Protected Route
const ProtectedRoute = ({ children }) => {
  const user = authStore((state) => state.user)
  const loading = authStore((state) => state.loading)

  if (loading) return <FullScreenSpinner />

  return user ? children : <Navigate to="/login" replace />
}

// Guest Route
const GuestRoute = ({ children }) => {
  const user = authStore((state) => state.user)
  const loading = authStore((state) => state.loading)

  if (loading) return <FullScreenSpinner />

  return user ? <Navigate to="/" replace /> : children
}

const RegisterRoute = ({ children }) => {
  const user = authStore((state) => state.user)
  const loading = authStore((state) => state.loading)
  const hasUsers = authStore((state) => state.hasUsers)

  if (loading || hasUsers === null) return <FullScreenSpinner />
  if (user) return <Navigate to="/" replace />
  if (hasUsers) return <Navigate to="/login" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const user = authStore((state) => state.user)
  const loading = authStore((state) => state.loading)
  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}


// Router
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

          <Route path="/register" element={<RegisterRoute><Register /></RegisterRoute>} />
          <Route path="/verify-otp" element={<GuestRoute><VerifyOTP /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/verify-reset-otp" element={<GuestRoute><VerifyResetOTP /></GuestRoute>} />
         <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          
        

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout/>
            </ProtectedRoute>
          }
>
          <Route index element={<Dashboard/>}/>

            Uncomment as you build each page:
          <Route path="products"     element={<Products />} />
          <Route path="categories"   element={<Categories />} />
          <Route path="suppliers"    element={<Suppliers />} />
          <Route path="orders"       element={<Orders />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}