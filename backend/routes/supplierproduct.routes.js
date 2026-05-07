import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import { createSupplierProduct } from "../controllers/supplierProduct.controller.js"

const router=express.Router()

router.post("/",protect,createSupplierProduct)
export default router