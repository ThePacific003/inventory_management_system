import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import { createSupplierProduct, deleteSupplierProduct, getAllSupplierProduct, getCheapestSupplierForProduct, getProductsBySupplier, getSupplierByProduct } from "../controllers/supplierProduct.controller.js"

const router=express.Router()

router.post("/",protect,createSupplierProduct)

router.get("/",protect,getAllSupplierProduct)

router.get("/products/:supplierId",protect,getProductsBySupplier)

router.get("/supplier/:productId",protect,getSupplierByProduct)

router.delete("/:supplierId/:productId",protect,deleteSupplierProduct)

router.get("/:productId",protect,getCheapestSupplierForProduct)
export default router