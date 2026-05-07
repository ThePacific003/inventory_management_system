import express from "express"
import { adminOnly, protect } from "../middleware/auth.middleware.js"
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../controllers/supplier.controller.js"

const router=express.Router()

router.get("/",protect, getAllSuppliers)
router.get("/:id",protect,getSupplierById)
router.post("/",protect,adminOnly,createSupplier)
router.put("/:id",protect,adminOnly,updateSupplier)
router.delete("/:id",protect,adminOnly,deleteSupplier)

export default router