import { param } from "express-validator";
import pool from "../database/dbConnect.js"
import { sendEmail } from "../nodemailer/nodemailer.js";

export const createTransaction=async(req,res)=>{
    try{
        const user_id=req.id

        const {product_id,type,quantity,note}=req.body
        

        if(!product_id || !type || !quantity){
            return res.status(400).json({
                success:false,
                message:"product_id, type and quantity are required"
            })
        }

        if(!['IN','OUT','ADJUSTMENT'].includes(type)){
            return res.status(400).json({ success: false, message: 'type must be IN, OUT or ADJUSTMENT' });
        }

        if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'quantity must be greater than 0' });
    }

    //check if product exists
    const product = await pool.query(` 
        SELECT id ,name,  quantity, low_stock_threshold FROM products WHERE id=$1
        `,[product_id])


        if (product.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentProduct = product.rows[0];
    const before = currentProduct.quantity;
    // calculate new quantity based on transaction type
    let newQuantity;
    if (type === 'IN') {
     newQuantity = before + quantity;
    } else if (type === 'OUT') {
      newQuantity = before - quantity;
    } else {
      // ADJUSTMENT — quantity is set directly
      newQuantity = quantity;
    }

    // prevent negative stock
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${currentProduct.name}. Current quantity is ${currentProduct.quantity}`,
      });
    }

    // insert stock transaction record
    const transaction = await pool.query(
      `INSERT INTO stock_transactions (product_id,product_name, user_id, type, quantity, note, stock_before, stock_after)
       VALUES ($1, $2, $3, $4, $5, $6,$7)
       RETURNING id, type, quantity, note, created_at`,
      [product_id,product.name, req.user.id, type, quantity, note || null,  before, newQuantity]
    );

// update product quantity
    const updatedProduct = await pool.query(
      `UPDATE products SET
        quantity   = $1,
        updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, quantity, low_stock_threshold`,
      [newQuantity, product_id]
    );

    const updated = updatedProduct.rows[0];

    // send low stock alert if quantity dropped below threshold
    if (updated.quantity <= updated.low_stock_threshold) {
      await sendEmail(
        process.env.NODE_MAILER_EMAIL,
        `Stock of product ${updated.name} is below threshold with quantity ${updated.quantity} `
      );
    }

     return res.status(201).json({
      success: true,
      message: 'Stock transaction recorded successfully',
      transaction: transaction.rows[0],
      product: {
        id: updated.id,
        name: updated.name,
        new_quantity: updated.quantity,
        low_stock_threshold: updated.low_stock_threshold,
        is_low_stock: updated.quantity <= updated.low_stock_threshold,
      },
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

export const getTransactionsByProduct = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, type, startDate, endDate } = req.query;

  const offset = (page - 1) * limit;

  let whereClause = 'WHERE st.product_id = $1';
  const params = [productId];
  let paramCount = 2;

  if (type) {
    whereClause += ` AND st.type = $${paramCount}`;
    params.push(type);
    paramCount++;
  }

  if (startDate) {
    whereClause += ` AND st.created_at >= $${paramCount}`;
    params.push(startDate);
    paramCount++;
  }

  if (endDate) {
    whereClause += ` AND st.created_at <= $${paramCount}`;
    params.push(endDate);
    paramCount++;
  }

  const dataQuery = `
    SELECT 
      st.id,
      st.type,
      st.quantity,
      st.note,
      st.created_at,
      p.id         AS product_id,
      p.name       AS product_name,
      p.quantity   AS current_stock,
      u.id         AS user_id,
      u.name       AS user_name,
      u.email      AS user_email
    FROM stock_transactions st
    LEFT JOIN products p ON st.product_id = p.id
    LEFT JOIN users u    ON st.user_id    = u.id
    ${whereClause}
    ORDER BY st.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM stock_transactions st
    ${whereClause}
  `;

  const dataParams  = [...params, parseInt(limit), parseInt(offset)];
  const countParams = [...params];
  
  try {
    const productCheck = await pool.query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, countParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        product: productCheck.rows[0],
        transactions: dataResult.rows,
        pagination: {
          currentPage:  parseInt(page),
          totalPages,
          totalCount,
          limit:        parseInt(limit),
          hasNextPage:  parseInt(page) < totalPages,
          hasPrevPage:  parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching transactions by product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getAllTransactions=async(req,res)=>{
    try{
        const { page = 1, limit = 10, type, startDate, endDate, productId, userId } = req.query;

        const offset=(page-1)*limit
        let conditions=[]
        let params=[]
        let paramCount=1

        if(type){
            conditions.push(`st.type=$${paramCount}`)
            params.push(type)
            paramCount++
        }

        if(productId){
            conditions.push(`st.product_id= $${paramCount}`)
            params.push(productId)
            paramCount++
        }

        if(startDate){
            conditions.push(`st.created_at>=$${paramCount}`)
            params.push(startDate)
            paramCount++
        }

        if(endDate){
            conditions.push(`st.created_at<=$${paramCount}`)
            params.push(endDate)
            paramCount++
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const dataQuery = `
    SELECT
      st.id,
      st.type,
      st.quantity,
       st.stock_before,
  st.stock_after,
      st.note,
      st.created_at,
      p.id          AS product_id,
      p.name        AS product_name,
      u.id          AS user_id,
      u.name        AS user_name,
      u.email       AS user_email
    FROM stock_transactions st
    LEFT JOIN products p ON st.product_id = p.id
    LEFT JOIN users u    ON st.user_id    = u.id
    ${whereClause}
    ORDER BY st.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM stock_transactions st
    ${whereClause}
  `;

  const dataParams  = [...params, parseInt(limit), parseInt(offset)];
  const countParams = [...params];

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, countParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    return res.status(200).json({
      success: true,
      data: {
        transactions: dataResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit:       parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}