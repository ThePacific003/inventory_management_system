import express from "express"
import { adminOnly, protect } from "../middleware/auth.middleware.js"
import { createTransaction, getAllTransactions, getTransactionsByProduct } from "../controllers/stock.controller.js"

const router=express.Router()

router.patch("/",protect,createTransaction)
router.get("/:productId",protect,getTransactionsByProduct)
router.get("/",protect,getAllTransactions)

export default router