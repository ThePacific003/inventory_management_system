import express from "express"
import { adminOnly, protect } from "../middleware/auth.middleware.js"
import { createTransaction, getAllTransactions, getTransactionsByProduct } from "../controllers/stock.controller.js"

const router=express.Router()

router.post("/",protect,createTransaction)
router.get("/:id",protect,getTransactionsByProduct)
router.get("/",protect,getAllTransactions)

export default router