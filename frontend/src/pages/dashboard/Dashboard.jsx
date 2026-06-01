import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import authStore from "../../store/authStore"
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}k`
    : String(n ?? 0)

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const statusColor = {
  pending:  { dot: 'bg-amber-400',  text: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  received: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  cancelled:{ dot: 'bg-red-400',    text: 'text-red-400',    bg: 'bg-red-400/10'    },
}

const txTypeColor = {
  IN:         { text: 'text-emerald-400', bg: 'bg-emerald-400/10', sign: '+' },
  OUT:        { text: 'text-red-400',     bg: 'bg-red-400/10',     sign: '−' },
  ADJUSTMENT: { text: 'text-blue-400',    bg: 'bg-blue-400/10',    sign: '~' },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent, delay }) {
  return (
    <div
      className="relative bg-[#141414] border border-white/8 rounded-2xl p-5 overflow-hidden group hover:border-white/15 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent glow */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 ${accent} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight leading-none mb-1.5">{value}</p>
          {sub && <p className="text-xs text-white/30">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${accent} bg-opacity-15 border border-white/8 flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">{title}</h2>
      {to && (
        <Link to={to} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
          {linkLabel}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#141414] border border-white/8 rounded-2xl p-5 animate-pulse">
      <div className="h-3 w-20 bg-white/10 rounded mb-4" />
      <div className="h-8 w-24 bg-white/10 rounded mb-2" />
      <div className="h-3 w-16 bg-white/5 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-white/8 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-2.5 bg-white/5 rounded w-1/2" />
      </div>
      <div className="h-3 w-10 bg-white/8 rounded" />
    </div>
  )
}

// ── Low stock bar ──────────────────────────────────────────────────────────────
function StockBar({ quantity, threshold }) {
  const pct = threshold > 0 ? Math.min((quantity / threshold) * 100, 100) : 0
  const color = quantity === 0 ? 'bg-red-500' : pct <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
 const { user, createStaff } = authStore(
  useShallow((state) => ({
    user: state.user,
    createStaff: state.createStaff,
  }))
)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showStaffForm, setShowStaffForm] = useState(false)
   const [form, setForm] = useState({name:'', email: '', password: '' })
   const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const navigate=useNavigate()
 const [showPassword, setShowPassword] = useState(false)
// const [staffForm, setStaffForm] = useState({
//   name: '',
//   email: '',
//   password: '',
// })

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
     await createStaff(form)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-white/50 text-sm">{error}</p>
      <button
        onClick={() => { setError(null); setLoading(true); api.get('/dashboard').then(r => setData(r.data.data)).catch(() => setError('Failed to load dashboard')).finally(() => setLoading(false)) }}
        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 rounded-lg px-3 py-1.5"
      >
        Retry
      </button>
    </div>
  )

  const ov  = data?.overview  ?? {}
  const ord = data?.orders    ?? {}
  const stk = data?.stock     ?? {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {loading ? 'Dashboard' : `Good ${hour()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
          </h1>
          <p className="text-white/35 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stock alert badge */}
        {!loading && (stk.out_of_stock > 0 || stk.low_stock > 0) && (
          <Link
            to="/products?filter=low-stock"
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium px-3 py-2 rounded-xl hover:bg-amber-500/15 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {stk.out_of_stock > 0 ? `${stk.out_of_stock} out of stock` : `${stk.low_stock} low stock`}
          </Link>
        )}

        {user?.role === 'admin' && (
         <button
        onClick={() => setShowStaffForm(true)}
        className="w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 p-3"
        >
         + Create Staff
         </button>
         )}
         </div>

      {/* ── Overview stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Products"
              value={fmt(ov.total_products)}
              sub="in catalogue"
              delay={0}
              accent="bg-indigo-500/20"
              icon={
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <StatCard
              label="Suppliers"
              value={fmt(ov.total_suppliers)}
              sub="active partners"
              delay={60}
              accent="bg-cyan-500/20"
              icon={
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <StatCard
              label="Orders"
              value={fmt(ov.total_orders)}
              sub={`${ord.pending ?? 0} pending`}
              delay={120}
              accent="bg-violet-500/20"
              icon={
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              label="Stock Value"
              value={fmtCurrency(ov.total_stock_value)}
              sub="total inventory"
              delay={180}
              accent="bg-emerald-500/20"
              icon={
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* ── Order status strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-[#141414] border border-white/8 rounded-xl p-4 animate-pulse">
              <div className="h-3 w-16 bg-white/10 rounded mb-3" />
              <div className="h-7 w-10 bg-white/10 rounded" />
            </div>
          ))
        ) : (
          [
            { key: 'pending',   label: 'Pending',   val: ord.pending   },
            { key: 'received',  label: 'Received',  val: ord.received  },
            { key: 'cancelled', label: 'Cancelled', val: ord.cancelled },
          ].map(({ key, label, val }) => (
            <div key={key} className="bg-[#141414] border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor[key].dot}`} />
                <span className="text-xs text-white/40 font-medium">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${statusColor[key].text}`}>{fmt(val)}</p>
            </div>
          ))
        )}
      </div>

      {/* ── Bottom grid: transactions + orders + low stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Transactions */}
        <div className="lg:col-span-1 bg-[#141414] border border-white/8 rounded-2xl p-5">
          <SectionHeader title="Recent Transactions" to="/transactions" linkLabel="View all" />
          <div className="divide-y divide-white/5">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : data?.recent_transactions?.length === 0
              ? <EmptyState label="No transactions yet" />
              : data?.recent_transactions?.map((tx) => {
                  const c = txTypeColor[tx.type] ?? txTypeColor.ADJUSTMENT
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3">
                      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-sm font-bold ${c.text}`}>{c.sign}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate font-medium">{tx.product_name}</p>
                        <p className="text-xs text-white/30 truncate">{tx.user_name} · {timeAgo(tx.created_at)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-semibold ${c.text}`}>{c.sign}{tx.quantity}</span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-[#141414] border border-white/8 rounded-2xl p-5">
          <SectionHeader title="Recent Orders" to="/orders" linkLabel="View all" />
          <div className="divide-y divide-white/5">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : data?.recent_orders?.length === 0
              ? <EmptyState label="No orders yet" />
              : data?.recent_orders?.map((o) => {
                  const s = statusColor[o.status] ?? statusColor.pending
                  return (
                    <div key={o.id} className="flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate font-medium">{o.supplier_name}</p>
                        <p className="text-xs text-white/30">{timeAgo(o.order_date)}</p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="text-xs font-semibold text-white/70">{fmtCurrency(o.total_amt)}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                          {o.status}
                        </span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Top Low Stock Items */}
        <div className="lg:col-span-1 bg-[#141414] border border-white/8 rounded-2xl p-5">
          <SectionHeader title="Low Stock Alert" to="/products?filter=low-stock" linkLabel="See all" />

          {/* Stock overview pills */}
          {!loading && (
            <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {stk.out_of_stock} out of stock
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {stk.low_stock} low
              </span>
            </div>
          )}

          <div className="divide-y divide-white/5">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : data?.top_low_stock_items?.length === 0
              ? <EmptyState label="All stock levels healthy" icon="✓" green />
              : data?.top_low_stock_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.quantity === 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                      <svg className={`w-4 h-4 ${item.quantity === 0 ? 'text-red-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StockBar quantity={item.quantity} threshold={item.low_stock_threshold} />
                        <span className="text-xs text-white/30">{item.quantity}/{item.low_stock_threshold}</span>
                      </div>
                    </div>
                    {item.quantity === 0 && (
                      <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-1.5 py-0.5 flex-shrink-0">
                        OUT
                      </span>
                    )}
                  </div>
                ))
            }
          </div>
        </div>
      </div>
      {showStaffForm && (

   <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
     <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">

             <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
              />
            </div>



            {/* Password */}

             {/* <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Password             
                 </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
              />
            </div> */}

               <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Staff
                </>
              ) : 'Create Staff'}
            </button>
            <div className='flex justify-center'>
                <button 
                type='button'
                onClick={()=> setShowStaffForm(false)}
                className="text-xs text-white/50 ">
                  Cancel
                </button>
                </div>
          </form>

          </div>
          </div>
              </div>
)}


</div>
  )}
// ── Tiny helpers ───────────────────────────────────────────────────────────────

function EmptyState({ label, icon = '—', green = false }) { 
  return (
    <div className="py-8 text-center">
      <p className={`text-sm ${green ? 'text-emerald-400/60' : 'text-white/20'}`}>{icon} {label}</p>
    </div>
  )
}

function hour() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
