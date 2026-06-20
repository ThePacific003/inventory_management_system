import { create } from 'zustand'
import api from '../api/axios'
// import toast from 'react-hot-toast'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user })
    } catch (error) {
        console.log(error)
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      set({ user: null })
    } catch (error) {
      console.log(error)
    }
  },

  login:async(datas)=>{
    try{
      const res=await api.post('/auth/login',datas)
      set({user:res.data.user})
      localStorage.setItem("user",JSON.stringify(res.data))
      return res.data.user
    }
    catch(error){
      console.log(error)
      // toast.error("Login Failed")
    }finally{
      set({loading:false})
    }
  },

  verifyOTP:async(data)=>{
    try{
      const res=await api.post('/auth/verify',data)
      set({user:res.data.user})
      localStorage.setItem("user",JSON.stringify(res.data))
      return res.data.user
    }
    catch(error){
     throw new error
    }
  },

  resetPassword:async(data)=>{
    try{
      await api.post("/auth/reset-password",data)
    }
    catch(err){
      throw new err
    }
  },

  forgotPassword:async(data)=>{
    try{
      await api.post('/auth/forgot-password',data)
    }
    catch(err){
      throw new err
    }
  },

  verifyResetOTP:async(data)=>{
    try{
      await api.post("/auth/reset-otp",data)
    }
    catch(err){
      throw new err
    }
  },

  createStaff:async(data)=>{
    try{
      const res=await api.post('/auth/create-staff',data)
      return res.data.users
    }
    catch(err){
      throw new err
    }
  }


}))

export default useAuthStore