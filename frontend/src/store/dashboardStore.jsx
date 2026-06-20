import { create } from "axios";
import api from "../api/axios";
import toast from "react-hot-toast";

const useDashboardStore=create((set)=>({

     dashboardStats: null,

  overview: null,
  orderStats: null,
  stockStats: null,

  recentTransactions: [],
  recentOrders: [],
  topLowStockItems: [],

    stockMovements: null,
  movementPeriod: 0,
  movementSummary: {},
  dailyMovements: [],
  topMovedProducts: [],

  lowStockData: null,
  lowStockSummary: null,
  lowStockItems: [],
  lowStockPagination: null,

  loading: false,

  getDashboardStats: async () => {
  try {
    set({ loading: true })

    const response = await api.get('/dashboard/')

    if (response.data.success) {
      const dashboardData = response.data.data

      set({
        dashboardStats: dashboardData,

        overview: dashboardData.overview,
        orderStats: dashboardData.orders,
        stockStats: dashboardData.stock,

        recentTransactions:
          dashboardData.recent_transactions,

        recentOrders:
          dashboardData.recent_orders,

        topLowStockItems:
          dashboardData.top_low_stock_items
      })

      return dashboardData
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch dashboard statistics'
    )
  } finally {
    set({ loading: false })
  }
},

getStockMovements: async (period = 7) => {
  try {
    set({ loading: true })

    const response = await api.get(
      `/movements?period=${period}`
    )

    if (response.data.success) {
      const movementData = response.data.data

      set({
        stockMovements: movementData,

        movementPeriod:
          movementData.period_days,

        movementSummary:
          movementData.summary,

        dailyMovements:
          movementData.daily_movements,

        topMovedProducts:
          movementData.top_moved_products
      })

      return movementData
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch stock movements'
    )
  } finally {
    set({ loading: false })
  }
},

getLowStockItems: async (filters = {}) => {
  try {
    set({ loading: true })

    const response = await api.get(
      '/dashboard/lowstock',
      {
        params: filters
      }
    )

    if (response.data.success) {
      const lowStockData = response.data.data

      set({
        lowStockData,

        lowStockSummary:
          lowStockData.summary,

        lowStockItems:
          lowStockData.items,

        lowStockPagination:
          lowStockData.pagination
      })

      return lowStockData
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch low stock items'
    )
  } finally {
    set({ loading: false })
  }
},



}))
export default useDashboardStore