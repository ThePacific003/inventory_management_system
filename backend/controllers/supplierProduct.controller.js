import pool from "../database/dbConnect.js";

export const createSupplierProduct = async (req, res) => {
  try {
    const { supplier_id, product_id, unit_price } = req.body;

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

    const supplierCheck = await pool.query(
      `SELECT id FROM suppliers WHERE id = $1`,
      [supplier_id],
    );
    if (supplierCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    // Check product exists
    const productCheck = await pool.query(
      `SELECT id FROM products WHERE id = $1`,
      [product_id],
    );
    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Insert or update if (supplier_id, product_id) pair already exists
    const result = await pool.query(
      `INSERT INTO supplier_products (supplier_id, product_id, unit_price)
       VALUES ($1, $2, $3)
       ON CONFLICT (supplier_id, product_id)
       DO UPDATE SET unit_price = EXCLUDED.unit_price, updated_at = NOW()
       RETURNING *`,
      [supplier_id, product_id, unit_price],
    );

    return res.status(201).json({
      success: true,
      message: "Supplier product price saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllSupplierProduct = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
      sp.id,
      sp.unit_price,
      sp.updated_at,
      s.id AS supplier_id,
      s.name AS supplier_name,
      s.email AS supplier_email,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS product_base_price
      FROM supplier_products sp
      LEFT JOIN suppliers s ON s.id=sp.supplier_id
      LEFT JOIN products p ON p.id=sp.product_id
      ORDER BY s.name ASC ,p.name ASC
      `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const supplierCheck = await pool.query(
      `SELECT id,name,email FROM suppliers WHERE id=$1`,
      [supplierId],
    );

    if (supplierCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const result = await pool.query(
      `
      SELECT
      sp.id,
      sp.unit_price,
      sp.updated_at,
      p.id AS product_id,
      p.name AS product_name,
      p.quantity AS current_stock,
      p.low_stock_threshold,
      p.price AS product_base_price,
      c.name AS category_name
      FROM supplier_products sp
      LEFT JOIN products p ON p.id=sp.product_id
      LEFT JOIN categories c ON c.id=p.category_id
      WHERE sp.supplier_id=$1
      ORDER BY p.name ASC
      `,
      [supplierId],
    );
    return res.status(200).json({
      success: true,
      supplier: supplierCheck.rows[0],
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSupplierByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const productCheck = await pool.query(
      `SELECT id,name FROM products WHERE id=$1`,
      [productId],
    );

    if(productCheck.rows.length===0){
      return res.status(404).json({
        success:false,
        message:"Product not found"
      })
    }

    const result=await pool.query(
      `
      SELECT
        sp.id,
        sp.unit_price,
        sp.updated_at,
        s.id      AS supplier_id,
        s.name    AS supplier_name,
        s.email   AS supplier_email,
        s.phone   AS supplier_phone,
        s.address AS supplier_address
      FROM supplier_products sp
      LEFT JOIN suppliers s ON s.id = sp.supplier_id
      WHERE sp.product_id = $1
      ORDER BY sp.unit_price ASC
      `,[productId]
    )

    return res.status(200).json({
      success:true,
      product:productCheck.rows[0],
      count:result.rows.length,
      data:result.rows
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteSupplierProduct=async(req,res)=>{
  try{
    const {supplierId, productId}=req.params

     const existing = await pool.query(
      `SELECT id FROM supplier_products WHERE supplier_id = $1 AND product_id = $2`,
      [supplierId, productId]
    );

     if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier-product price entry not found",
      });
    }

     // Block deletion if there are pending orders using this supplier-product combo
    const pendingOrders = await pool.query(`
      SELECT oi.id
      FROM order_items oi
      JOIN purchase_orders po ON po.id = oi.order_id
      WHERE oi.product_id = $1
        AND po.supplier_id = $2
        AND po.status = 'pending'
    `, [productId, supplierId]);
 
    if (pendingOrders.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove price entry: product has pending orders with this supplier",
      });
    }

     await pool.query(
      `DELETE FROM supplier_products WHERE supplier_id = $1 AND product_id = $2`,
      [supplierId, productId]
    );

    return res.status(200).json({
      success: true,
      message: "Supplier-product price entry removed successfully",
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

export const getCheapestSupplierForProduct=async(req,res)=>{
  try{
     const { productId } = req.params;
 
    const productCheck = await pool.query(
      `SELECT id, name FROM products WHERE id = $1`,
      [productId]
    );
 
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

     const result = await pool.query(`
      SELECT
        sp.unit_price,
        sp.updated_at,
        s.id      AS supplier_id,
        s.name    AS supplier_name,
        s.email   AS supplier_email,
        s.phone   AS supplier_phone
      FROM supplier_products sp
      LEFT JOIN suppliers s ON s.id = sp.supplier_id
      WHERE sp.product_id = $1
      ORDER BY sp.unit_price ASC
      LIMIT 1
    `, [productId]);
 
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No suppliers found for this product",
      });
    }
 
    return res.status(200).json({
      success: true,
      product: productCheck.rows[0],
      cheapest_supplier: result.rows[0],
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