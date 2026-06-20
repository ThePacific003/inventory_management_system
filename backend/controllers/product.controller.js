import { compareSync } from "bcryptjs";
import pool from "../database/dbConnect.js";

import { sendEmail } from "../nodemailer/nodemailer.js";

//get all product (protect)
export const getAllProducts=async(req , res)=>{
    try{
         const { search, category, sort } = req.query;

         let baseQuery=`
         SELECT p.id,p.name,p.description,p.price, p.quantity, p.low_stock_threshold, p.created_at, p.updated_at,
         c.name AS category_name,
         s.name AS supplier_name
         FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s  ON p.supplier_id = s.id
      WHERE 1=1
         `;

         const values=[];

         let idx=1;

         //search by product name
         if (search) {
      baseQuery += ` AND LOWER(p.name) LIKE LOWER($${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

     // filter by category id
    if (category) {
      baseQuery += ` AND p.category_id = $${idx}`;
      values.push(category);
      idx++;
    }

    // sorting
    const sortOptions = {
      price_asc:  'p.price ASC',
      price_desc: 'p.price DESC',
      name_asc:   'p.name ASC',
      name_desc:  'p.name DESC',
      qty_asc:    'p.quantity ASC',
      qty_desc:   'p.quantity DESC',
    };
    baseQuery += ` ORDER BY ${sortOptions[sort] || 'p.created_at DESC'}`;

     const result = await pool.query(baseQuery, values);

     return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });


    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//get single product by id
export const getProductById=async(req,res)=>{
    try{

        const {id}=req.params
        const product=await pool.query(`
            SELECT 
            p.id, p.name, p.description, p.price, p.quantity, p.low_stock_threshold, p.created_at, p.updated_at,
            c.name AS category_name, c.id AS category_id,
            s.name AS supplier_name, s.id AS supplier_id
            FROM products p
            LEFT JOIN categories c ON p.category_id=c.id
            LEFT JOIN suppliers s ON p.supplier_id=s.id
            WHERE p.id=$1
            `,[id]);

            if (product.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // fetch full stock transaction history for this product
    const history = await pool.query(
      `SELECT 
        st.id, st.type, st.quantity, st.note, st.created_at,
        u.name AS performed_by
       FROM stock_transactions st
       LEFT JOIN users u ON st.user_id = u.id
       WHERE st.product_id = $1
       ORDER BY st.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      product: product.rows[0],
      history: history.rows,
    });
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//create product (protected) can only be performed by admin
export const createProduct=async(req,res)=>{
    try{
        const {name,description, price, quantity , low_stock_threshold, category_id, supplier_id}=req.body;

        if(!name || price===undefined || quantity===undefined){
            return res.status(400).json({
                success:false,
                message:"Name , price and quanity are required"
            })
        }

        const nameRegex = /^(?!\s+$)[a-zA-Z0-9\s\-]{3,100}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Product name must be 3–100 characters and contain only letters, numbers, and spaces"
      });
    }


    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const parsedThreshold = Number(low_stock_threshold ?? 10);

    if (isNaN(parsedPrice) || isNaN(parsedQuantity) || isNaN(parsedThreshold)) {
      return res.status(400).json({
        success: false,
        message: "Price, quantity and threshold must be valid numbers"
      });
    }

        if(parsedPrice<0 || parsedQuantity<0){
            return res.status(400).json({
                success:false,
                message:"Price and quantity cannot be negative"
            })
        }

        if (supplier_id) {
  const supplierCheck = await pool.query(
    'SELECT id FROM suppliers WHERE id = $1',
    [supplier_id]
  );

  if (supplierCheck.rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid supplier_id: supplier does not exist'
    });
  }
}

const existing_product=await pool.query(`SELECT id FROM products WHERE lower(name)=lower($1)`,[name])

if(existing_product.rows.length>0){
  return res.status(400).json({
    success:false,
    message:"Product already exist with this name"
  })
}

        const newProduct = await pool.query(
      `INSERT INTO products 
        (name, description, price, quantity, low_stock_threshold, category_id, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, price, quantity, low_stock_threshold, created_at`,
      [
        name,
        description || null,
        parsedPrice,
        parsedQuantity,
        parsedThreshold || 10,
        category_id || null,
        supplier_id || null,
      ]
    );

    const product = newProduct.rows[0];

    // check immediately if added quantity is already below threshold
    if (product.quantity <= product.low_stock_threshold) {
      await sendEmail(
        process.env.NODE_MAILER_EMAIL,
       `Product you created named ${product.name} is below low stock threshold with quantity ${product.quantity}`
      );
    }


    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
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

//update product
export const updateProduct=async(req,res)=>{
    try{
         const { id } = req.params;
         
    const {
      name, description, price,
      low_stock_threshold, category_id, supplier_id,
    } = req.body;
    
    // check product exists
    const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // quantity is intentionally excluded here
    // use POST /stock/transaction to change quantity
    const updated = await pool.query(
      `UPDATE products SET
        name               = COALESCE($1, name),
        description        = COALESCE($2, description),
        price              = COALESCE($3, price),
        low_stock_threshold= COALESCE($4, low_stock_threshold),
        category_id        = COALESCE($5, category_id),
        supplier_id        = COALESCE($6, supplier_id),
        updated_at         = NOW()
       WHERE id = $7
       RETURNING id, name, description, price, quantity, low_stock_threshold, updated_at`,
      [name, description, price, low_stock_threshold, category_id, supplier_id, id]
    );
    console.log(updated.rows[0]);
    
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated.rows[0],
    });
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//delete product (admin only+protected)
export const deleteProduct=async(req,res)=>{
    try{
        const { id } = req.params;

        const existing=await pool.query(`SELECT id,name FROM products WHERE id=$1`,[id])

        if(existing.rows.length===0){
            return res.json({
                success:false,
                message:"Product not found"
            })
        }

        // block deletion if product has pending order items linked
    const pendingOrders = await pool.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN purchase_orders po ON oi.order_id = po.id
       WHERE oi.product_id = $1 AND po.status = 'pending'`,
      [id]
    );

     if (pendingOrders.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with pending purchase orders. Cancel the orders first.',
      });
    }

     await pool.query('DELETE FROM products WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: `Product "${existing.rows[0].name}" deleted successfully`,
    });

    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//get low stock products (protected)
export const getLowStockProducts=async(req,res)=>{
    try {
        const result=await pool.query(`
            SELECT 
            p.id,p.name,p.price,p.quantity,p.low_stock_threshold,
            c.name AS category_name,
            s.name AS supplier_name,
            s.email AS supplier_email
            FROM products p
            LEFT JOIN categories c ON p.category_id=c.id
            LEFT JOIN suppliers s ON p.supplier_id=s.id
            WHERE p.quantity<=p.low_stock_threshold
            ORDER BY p.quantity ASC
            `)

            return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}