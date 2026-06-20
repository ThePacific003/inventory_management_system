import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useCategoryStore=create((set)=>({
    categories:[],
    loading:false,
     selectedCategory: null,
  categoryProducts: [],
   createCategory: async (categoryData) => {
  try {
    set({ loading: true })

    const response = await api.post(
      '/category/',
      categoryData
    )

    if (response.data.success) {
      set((state) => ({
        categories: [
          ...state.categories,
          response.data.category
        ]
      }))

      toast.success(response.data.message)

      return response.data.category
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to create category'
    )
  } finally {
    set({ loading: false })
  }
},

getAllCategories: async () => {
  try {
    set({ loading: true })

    const response = await api.get('/category/')

    if (response.data.success) {
      set({
        categories: response.data.categories
      })

      return response.data.categories
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch categories'
    )
  } finally {
    set({ loading: false })
  }
},

updateCategory: async (id, updatedData) => {
  try {
    set({ loading: true })

    const response = await api.put(
      `/category/${id}`,
      updatedData
    )

    if (response.data.success) {
      const updatedCategory = response.data.category

      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id
            ? { ...cat, ...updatedCategory }
            : cat
        )
      }))

      toast.success(response.data.message)

      return updatedCategory
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to update category'
    )
  } finally {
    set({ loading: false })
  }
},

getCategoryById: async (id) => {
  try {
    set({ loading: true })

    const response = await api.get(`/category/${id}`)

    if (response.data.success) {
      set({
        selectedCategory: response.data.category,
        categoryProducts: response.data.products
      })

      return response.data
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch category details'
    )
  } finally {
    set({ loading: false })
  }
},

deleteCategory: async (id) => { 
  try {
    set({ loading: true })

    const response = await api.delete(`/category/${id}`)

    if (response.data.success) {
      set((state) => ({
        categories: state.categories.filter(
          (cat) => cat.id !== id
        ),
        selectedCategory:
          state.selectedCategory?.id === id
            ? null
            : state.selectedCategory
      }))

      toast.success(
        response.data.message || 'Category deleted successfully'
      )

      return true
    }

    toast.error(response.data.message)
    return false
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to delete category'
    )

    return false
  } finally {
    set({ loading: false })
  }
},

}))
export default useCategoryStore