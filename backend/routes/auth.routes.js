import { login, registerUser,verifyOTP,forgotPassword,resetPw ,logout,getMe, createStaffByAdmin, deleteUser, verifyResetOtp} from "../controllers/auth.controller.js";
import express from 'express'
import {adminOnly, protect} from '../middleware/auth.middleware.js'
import pool from '../database/dbConnect.js'
const router=express.Router()

//public
router.post("/register",registerUser);
router.post("/verify",verifyOTP);
router.post("/login",login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPw);
router.post('/reset-otp',verifyResetOtp);
// protected
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

//admin only
router.post("/create-staff",protect,adminOnly,createStaffByAdmin);
router.delete("/users/:id",protect,adminOnly,deleteUser);

router.get("/has-users",async(req ,res)=>{
    try{
        const result = await pool.query(`SELECT COUNT(*) FROM users`)
    const count = parseInt(result.rows[0].count)
    return res.status(200).json({ success: true, hasUsers: count > 0 })
    }
    catch(error){
         return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

export default router
