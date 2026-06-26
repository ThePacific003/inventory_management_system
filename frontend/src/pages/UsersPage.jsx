import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { useShallow } from 'zustand/react/shallow'

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d < 1) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  const m = Math.floor(d / 30)
  if (m < 12) return `${m}mo ago`
  return `${Math.floor(m / 12)}y ago`
}

export default function UsersPage() {
  const { fetchAllUsers, deleteUser, user: currentUser } = useAuthStore(
    useShallow((state) => ({
      fetchAllUsers: state.fetchAllUsers,
      deleteUser: state.deleteUser,
      user: state.user,
    }))
  )

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

 useEffect(() => {
  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers()
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  loadUsers()
}, [fetchAllUsers])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteUser(id)
      toast.success('User deleted successfully')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const roleColor = (role) =>
    role === 'admin'
      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
      : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-white/35 text-sm mt-1">Manage staff accounts</p>
        </div>
        <div className="text-xs text-white/30 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-white/8 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
                <div className="h-5 w-12 bg-white/8 rounded-md" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/20 text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-400">
                    {u.name?.[0]?.toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/80 truncate">{u.name}</p>
                    {u.id === currentUser?.id && (
                      <span className="text-[10px] text-white/30 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">you</span>
                    )}
                  </div>
                  <p className="text-xs text-white/30 truncate">{u.email} · joined {timeAgo(u.created_at)}</p>
                </div>

                {/* Role badge */}
                <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 flex-shrink-0 ${roleColor(u.role)}`}>
                  {u.role}
                </span>

                {/* Delete button — hidden for self and other admins */}
                {u.id !== currentUser?.id && u.role !== 'admin' && (
                  confirmId === u.id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-white/40">Sure?</span>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === u.id ? 'Deleting...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(u.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/8 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}