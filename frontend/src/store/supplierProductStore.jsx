import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useSupplierProduct=create((set)=>({
     supplierProducts: [],
  supplierProductsBySupplier: [],
  suppliersByProduct: [],
  selectedProduct: null,
  selectedSupplier: null,
  cheapestSupplier: null,
  supplierProductCount: 0,
  loading: false,

  createSupplierProduct: async (data) => {
  try {
    set({ loading: true })

    const response = await api.post('/supplierPro/', data)

    if (response.data.success) {
      const supplierProduct = response.data.data

      set((state) => ({
        supplierProducts: [
          ...state.supplierProducts,
          supplierProduct
        ]
      }))

      toast.success(response.data.message)

      return {
        supplierProduct,
        message: response.data.message
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to save supplier product price'
    )
  } finally {
    set({ loading: false })
  }
},

getAllSupplierProduct: async () => {
  try {
    set({ loading: true })

    const response = await api.get('/supplierPro/')

    if (response.data.success) {
      set({
        supplierProducts: response.data.data,
        supplierProductCount: response.data.count
      })

      return response.data.data
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to fetch supplier products'
    )
  } finally {
    set({ loading: false })
  }
},

getProductsBySupplier: async (supplierId) => {
  try {
    set({ loading: true })

    const response = await api.get(
      `/supplierPro/products/${supplierId}`
    )

    if (response.data.success) {
      set({
        selectedSupplier: response.data.supplier,
        supplierProductsBySupplier: response.data.data,
        supplierProductCount: response.data.count
      })

      return {
        supplier: response.data.supplier,
        products: response.data.data,
        count: response.data.count
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to fetch supplier products'
    )
  } finally {
    set({ loading: false })
  }
},

getSupplierByProducts: async (productId) => {
  try {
    set({ loading: true })

    const response = await api.get(
      `/supplierPro/supplier/${productId}`
    )

    if (response.data.success) {
      set({
        selectedProduct: response.data.product,
        suppliersByProduct: response.data.data,
        supplierProductCount: response.data.count
      })

      return {
        product: response.data.product,
        suppliers: response.data.data,
        count: response.data.count
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to fetch suppliers for product'
    )
  } finally {
    set({ loading: false })
  }
},

getCheapestSupplierForProduct: async (productId) => {
  try {
    set({ loading: true })

    const response = await api.get(`/supplierPro/${productId}`)

    if (response.data.success) {
      set({
        selectedProduct: response.data.product,
        cheapestSupplier: response.data.cheapest_supplier
      })

      return {
        product: response.data.product,
        cheapestSupplier: response.data.cheapest_supplier
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to fetch cheapest supplier'
    )
  } finally {
    set({ loading: false })
  }
},
 
deleteSupplierProduct: async (supplierId, productId) => {
  try {
    set({ loading: true })

    const response = await api.delete(
      `/supplierPro/${supplierId}/${productId}`
    )

    if (response.data.success) {
      set((state) => ({
        supplierProducts: state.supplierProducts.filter(
          (item) =>
            !(
              item.supplier_id === supplierId &&
              item.product_id === productId
            )
        ),

        supplierProductsBySupplier:
          state.supplierProductsBySupplier.filter(
            (item) => item.product_id !== productId
          ),

        suppliersByProduct:
          state.suppliersByProduct.filter(
            (item) => item.supplier_id !== supplierId
          ),

        cheapestSupplier:
          state.cheapestSupplier?.supplier_id === supplierId
            ? null
            : state.cheapestSupplier
      }))

      toast.success(
        response.data.message ||
          'Supplier product deleted successfully'
      )

      return true
    }

    toast.error(response.data.message)
    return false
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to delete supplier product'
    )

    return false
  } finally {
    set({ loading: false })
  }
},



}))
export default useSupplierProduct