import pool from "../database/dbConnect.js";

export const createSupplierProduct=async(req,res)=>{
    try{
        const{supplier_id, product_id,unit_price}=req.body;

         if (!supplier_id || !product_id || unit_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "supplier_id, product_id, and unit_price are required",
      });
    }

    if (unit_price <= 0) {
      return res.status(400).json({
        success: false,
        message: "unit_price must be greater than 0",
      });
    }

    const supplierCheck = await pool.query(`SELECT id FROM suppliers WHERE id = $1`, [supplier_id]);
    if (supplierCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

     // Check product exists
    const productCheck = await pool.query(`SELECT id FROM products WHERE id = $1`, [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Insert or update if (supplier_id, product_id) pair already exists
    const result = await pool.query(
      `INSERT INTO supplier_products (supplier_id, product_id, unit_price)
       VALUES ($1, $2, $3)
       ON CONFLICT (supplier_id, product_id)
       DO UPDATE SET unit_price = EXCLUDED.unit_price, updated_at = NOW()
       RETURNING *`,
      [supplier_id, product_id, unit_price]
    );

     return res.status(201).json({
      success: true,
      message: "Supplier product price saved successfully",
      data: result.rows[0],
    });
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}