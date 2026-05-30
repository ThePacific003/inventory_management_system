import express from "express"
import { getDashboardStats, getLowStockItems, getStockMovements } from "../controllers/dashboard.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router=express.Router()

router.get('/',protect,getDashboardStats)

router.put("/movements",protect,getStockMovements)

router.get("/lowstock",protect,getLowStockItems)

export default router