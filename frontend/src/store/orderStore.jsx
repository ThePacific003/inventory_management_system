import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useOrderStore=create((set,get)=>({
    orders: [],
  loading: false,
  orderItems: {},
orderCount: 0,
  selectedOrder: null,
 createOrder: async (orderData) => {
  try {
    set({ loading: true })

    const response = await api.post('/orders/', orderData)

    if (response.data.success) {
      const { order, items } = response.data.data

      set((state) => ({
        orders: [order, ...state.orders],
        orderItems: {
          ...state.orderItems,
          [order.id]: items
        }
      }))

      toast.success(response.data.message)

      return { order, items }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to create order'
    )
  } finally {
    set({ loading: false })
  }
}, 

getAllOrders: async () => {
  try {
    set({ loading: true })

    const response = await api.get('/orders/')

    if (response.data.success) {
      set({
        orders: response.data.data,
        orderCount: response.data.count
      })

      return response.data.data
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch orders'
    )
  } finally {
    set({ loading: false })
  }
},

getOrderById: async (id) => {
  try {
    set({ loading: true })

    const response = await api.get(`/orders/${id}`)

    if (response.data.success) {
      const orderData = response.data.data

      set({
        selectedOrder: orderData,
        orderItems: {
          ...get().orderItems,
          [orderData.id]: orderData.items
        }
      })

      return orderData
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to fetch order details'
    )
  } finally {
    set({ loading: false })
  }
},

updateOrderStatus: async (id) => {
  try {
    set({ loading: true })

    const response = await api.patch(`/orders/${id}`)

    if (response.data.success) {
      const updatedOrder = response.data.data

      set((state) => ({
        // update orders list
        orders: state.orders.map((order) =>
          order.id === id
            ? { ...order, ...updatedOrder }
            : order
        ),

        // update selected order if opened
        selectedOrder:
          state.selectedOrder?.id === id
            ? { ...state.selectedOrder, ...updatedOrder }
            : state.selectedOrder
      }))

      toast.success(response.data.message)

      return {
        order: updatedOrder,
        message: response.data.message
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to update order status'
    )
  } finally {
    set({ loading: false })
  }
},

cancelOrder: async (id) => {
  try {
    set({ loading: true })

    const response = await api.patch(`/orders/cancel/${id}`)

    if (response.data.success) {
      const cancelledOrder = response.data.data

      set((state) => ({
        // update orders list
        orders: state.orders.map((order) =>
          order.id === id
            ? { ...order, ...cancelledOrder }
            : order
        ),

        // update selected order if currently viewed
        selectedOrder:
          state.selectedOrder?.id === id
            ? { ...state.selectedOrder, ...cancelledOrder }
            : state.selectedOrder
      }))

      toast.success(response.data.message || 'Order cancelled successfully')

      return {
        order: cancelledOrder,
        message: response.data.message
      }
    }
  } catch (error) {
    console.error(error)

    toast.error(
      error.response?.data?.message ||
        'Failed to cancel order'
    )
  } finally {
    set({ loading: false })
  }
}, 

updateOrder:async(id,orderData)=>{
  try{
     set({ loading: true });

    const response = await api.put(`/orders/${id}`, orderData);

    if (response.data.success) {
      const { order, items } = response.data.data;

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...order } : o
        ),

        selectedOrder:
          state.selectedOrder?.id === id
            ? {
                ...state.selectedOrder,
                ...order,
                items,
              }
            : state.selectedOrder,

        orderItems: {
          ...state.orderItems,
          [id]: items,
        },
      }));

      toast.success(response.data.message);

      return {
        order,
        items,
        message: response.data.message,
      };
    }
  }
  catch(error){
    console.error(error);

    toast.error(
      error.response?.data?.message ||
        "Failed to update order"
    );
  }finally{
    set({ loading: false });
  }
}



}))
export default useOrderStore