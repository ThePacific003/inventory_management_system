import {create} from "zustand"
import api from "../api/axios"
import toast from "react-hot-toast"

const useStockStore=create((set)=>({
    transactions:[],
    productTransactions:[],
    selectedProduct:null,
    lastUpdatedProduct: null,

     pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  }, 

   loading: false,
  creating: false,
  error: null,

   createTransaction: async (data) => {
    set({ creating: true, error: null });

    try {
      const res = await api.patch("/stock", data);

      // optionally update UI instantly
      const newTransaction = res.data.transaction;
    //   const updatedProduct = res.data.product;

      // prepend new transaction if list exists
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
         lastUpdatedProduct: res.data.product,
        creating: false,
      }));

      toast.success("Transaction recorded successfully");

      return { success: true, data: res.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create transaction";

      set({ creating: false, error: message });
      toast.error(message);

      return { success: false };
    }
  },

   fetchTransactionsByProduct: async (productId, filters = {}) => {
    set({ loading: true, error: null, selectedProduct: productId });

    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const res = await api.get(`/stock/${productId}`, { params });

      set({
        productTransactions: res.data.data.transactions,
        pagination: res.data.data.pagination,
        loading: false,
      });

      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to fetch product transactions";

      set({ loading: false, error: message });
      toast.error(message);

      return null;
    }
  },

  fetchAllTransactions: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
     const params = {
  page: filters.page || 1,
  limit: filters.limit || 10,
  type: filters.type || undefined,
  startDate: filters.startDate || undefined,
  endDate: filters.endDate || undefined,
  productId: filters.productId || undefined,
  userId: filters.userId || undefined
};

      const res = await api.get("/stock", { params });

      set({
        transactions: res.data.data.transactions,
        pagination: res.data.data.pagination,
        loading: false,
      });

      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to fetch transactions";

      set({ loading: false, error: message });
      toast.error(message);

      return null;
    }
  },

   resetStockState: () => {
    set({
      transactions: [],
      productTransactions: [],
      selectedProduct: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      loading: false,
      creating: false,
      error: null,
    });
  },



}))
export default useStockStore