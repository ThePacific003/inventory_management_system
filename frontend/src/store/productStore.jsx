import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useProductStore = create((set,get) => ({
  products: [],
  loading: false,
  lowStockProducts: [],
  selectedProduct: null,
  productHistory: [], 
  productCount: 0,
  fetchProducts: async () => {
    try {
      await api.get("/products/");
    } catch (error) {
      throw new error();
    }
  },

  createProduct: async (productData) => {
    try {
      set({ loading: true });

      const { data } = await api.post("/products/", productData);

      if (data.success) {
        set((state) => ({
          products: [...state.products, data.product],
        }));

        toast.success(data.message);
        await get().getAllProducts()
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getLowStockProducts: async () => {
    try {
      set({ loading: true });

      const response = await api.get("/products/low-stock");

      if (response.data.success) {
        set({ lowStockProducts: response.data.products });
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Failes to fetch low stock products",
      );
    } finally {
      set({ loading: false });
    }
  },

  getProductById: async (id) => {
    try {
      set({ loading: true });

      const response = await api.get(`/products/${id}`);

      if (response.data.success) {
        set({
          selectedProduct: response.data.product,
          productHistory: response.data.history,
        });

        return response.data;
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch product details",
      );
    } finally {
      set({ loading: false });
    }
  },

  getAllProducts: async () => {
    try {
      set({ loading: true });

      const response = await api.get("/products/");

      if (response.data.success) {
        set({
          products: response.data.products || [],
          productCount: response.data.count || 0,
        });
      }
    } catch (error) {
      console.log(error)
      console.log(error.response)
      console.log(error.message) 
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      console.log(id,updatedData)
      set({ loading: true });

      const response = await api.put(`/products/${id}`, updatedData);

      if (response.data.success) {
        const updatedProduct = response.data.product;

        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updatedProduct } : product,
          ),
          selectedProduct:
            state.selectedProduct?.id === id
              ? { ...state.selectedProduct, ...updatedProduct }
              : state.selectedProduct,
        }));

        toast.success(response.data.message);

        return updatedProduct;
      }
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
  try {
    set({ loading: true })

    const response = await api.delete(`/products/${id}`)

    if (response.data.success) {
      set((state) => ({
        products: state.products.filter(
          (product) => product.id !== id
        ),
        selectedProduct:
          state.selectedProduct?.id === id
            ? null
            : state.selectedProduct
      }))

      toast.success(
        response.data.message || 'Product deleted successfully'
      )

      return true
    }

    toast.error(response.data.message)
    return false
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message || 'Failed to delete product'
    )

    return false
  } finally {
    set({ loading: false })
  }
}

}));

export default useProductStore;
