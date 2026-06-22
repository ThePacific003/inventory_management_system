// src/App.jsx

import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import authStore from './store/authStore'

function App() {
  const fetchUser = authStore((state) => state.fetchUser)
   const checkHasUsers = authStore((state) => state.checkHasUsers)
  useEffect(() => {
    fetchUser()
    checkHasUsers()
  }, [fetchUser,checkHasUsers])

  return <AppRoutes />
}

export default App