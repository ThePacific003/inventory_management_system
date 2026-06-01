// src/App.jsx

import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import authStore from './store/authStore'

function App() {
  const fetchUser = authStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return <AppRoutes />
}

export default App