import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useSupplierStore=create((set)=>({
  suppliers: [],
  loading: false,
  selectedSupplier: null,
  supplierProducts: [],
  supplierOrders: [],

  createSupplier: async (supplierData) => {
  try {
    set({ loading: true })

    const response = await api.post(
      '/supplier/',
      supplierData
    )

    if (response.data.success) {
      set((state) => ({
        suppliers: [
          ...state.suppliers,
          response.data.supplier
        ]
      }))

      toast.success(response.data.message)

      return response.data.supplier
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to create supplier'
    )
  } finally {
    set({ loading: false })
  }
},

    getAllSuppliers: async () => {
  try {
    set({ loading: true })

    const response = await api.get('/supplier/')

    if (response.data.success) {
  const normalized = response.data.suppliers.map((s) => ({
    ...s,
    total_orders: Number(s.total_orders || 0),
    total_products: Number(s.total_products || 0),
  }));

  set({
    suppliers: normalized,
  });
}
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch suppliers'
    )
  } finally {
    set({ loading: false })
  }
},

updateSupplier: async (id, updatedData) => {
  try {
    set({ loading: true })

    const response = await api.put(
      `/supplier/${id}`,
      updatedData
    )

    if (response.data.success) {
      const updatedSupplier = response.data.supplier

      set((state) => ({
        suppliers: state.suppliers.map((supplier) =>
          supplier.id === id
            ? { ...supplier, ...updatedSupplier }
            : supplier
        )
      }))

      toast.success(response.data.message)

      return updatedSupplier
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to update supplier'
    )
  } finally {
    set({ loading: false })
  }
},

getSupplierById: async (id) => {
  try {
    set({ loading: true })

    const response = await api.get(`/supplier/${id}`)

    if (response.data.success) {
      set({
        selectedSupplier: response.data.supplier,
        supplierProducts: response.data.products,
        supplierOrders: response.data.orders
        
      })        
      
      return response.data
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch supplier details'
    )
  } finally {
    set({ loading: false })
  }
},
deleteSupplier: async (id) => {
  try {
    set({ loading: true })

    const response = await api.delete(`/supplier/${id}`)

    if (response.data.success) {
      set((state) => ({
        suppliers: state.suppliers.filter(
          (supplier) => supplier.id !== id
        ),
        selectedSupplier:
          state.selectedSupplier?.id === id
            ? null
            : state.selectedSupplier
      }))

      toast.success(response.data.message || 'Supplier deleted successfully')

      return true
    }

    toast.error(response.data.message)
    return false
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to delete supplier'
    )

    return false
  } finally {
    set({ loading: false })
  }
},

})
)
export default useSupplierStore