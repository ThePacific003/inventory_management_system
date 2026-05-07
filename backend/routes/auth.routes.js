import { login, registerUser,verifyOTP,forgotPassword,resetPw ,logout,getMe, createStaffByAdmin, deleteUser, verifyResetOtp} from "../controllers/auth.controller.js";
import express from 'express'
import {adminOnly, protect} from '../middleware/auth.middleware.js'
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

export default router
