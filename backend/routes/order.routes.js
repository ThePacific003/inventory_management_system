import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import { cancelOrder, createOrder, getAllOrders, getOrderById, receivedOrder } from "../controllers/order.controller.js"

const router=express.Router()

router.post('/',protect,createOrder)
router.get('/',protect,getAllOrders)
router.get('/:id',protect,getOrderById)
router.patch('/:id',protect,receivedOrder)
router.patch('/cancel/:id',protect,cancelOrder)
export default router