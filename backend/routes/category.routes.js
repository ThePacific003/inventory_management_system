import express from "express"
import { adminOnly, protect } from "../middleware/auth.middleware.js"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js"

const router=express.Router()

router.get("/", protect,getAllCategories);
router.post("/",protect,adminOnly,createCategory);
router.put("/:id",protect,adminOnly,updateCategory);
router.delete("/:id",protect, adminOnly,deleteCategory)
router.get("/:id",protect,getCategoryById)

export default router



