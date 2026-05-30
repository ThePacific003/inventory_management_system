import pool from '../database/dbConnect.js'
import { sendOrderEmail } from '../nodemailer/nodemailer.js';

export const createOrder = async (req, res) => {
  try {
    const { supplier_id, items } = req.body;
    const user_id = req.user.id;

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "supplier_id and items array are required",
      });
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Each item must have product_id and quantity",
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "quantity must be greater than 0",
        });
      }
    }

    const supplierCheck = await pool.query(
      `SELECT id, name, email FROM suppliers WHERE id = $1`,
      [supplier_id]
    );
    if (supplierCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    const supplier = supplierCheck.rows[0];

    const productIds = items.map((item) => item.product_id);

    const productsCheck = await pool.query(
      `SELECT id, name FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );
    if (productsCheck.rows.length !== productIds.length) {
      return res.status(400).json({ success: false, message: "One or more products not found" });
    }

    // Map product_id → product_name for email use
    const productMap = {};
    productsCheck.rows.forEach((row) => {
      productMap[row.id] = row.name;
    });

    // Fetch unit prices from supplier_products
    const supplierPricesResult = await pool.query(
      `SELECT product_id, unit_price FROM supplier_products
       WHERE supplier_id = $1 AND product_id = ANY($2::int[])`,
      [supplier_id, productIds]
    );

    const priceMap = {};
    supplierPricesResult.rows.forEach((row) => {
      priceMap[row.product_id] = parseFloat(row.unit_price);
    });

    for (const item of items) {
      if (priceMap[item.product_id] === undefined) {
        return res.status(400).json({
          success: false,
          message: `No supplier price found for product_id ${item.product_id} with this supplier`,
        });
      }
    }

    const total_amount = items.reduce(
      (sum, item) => sum + item.quantity * priceMap[item.product_id],
      0
    );

    const orderResult = await pool.query(
      `INSERT INTO purchase_orders (supplier_id, user_id, status, total_amt)
       VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [supplier_id, user_id, total_amount]
    );
    const order = orderResult.rows[0];

    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ${items.map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`).join(',')}
      RETURNING *
    `;

    const orderItemsParams = [order.id];
    items.forEach((item) => {
      orderItemsParams.push(item.product_id, item.quantity, priceMap[item.product_id]);
    });

    const orderItemsResult = await pool.query(orderItemsQuery, orderItemsParams);

    // ✅ NEW: build enriched items list with product_name for the email
    const emailItems = orderItemsResult.rows.map((row) => ({
      product_name: productMap[row.product_id],
      quantity: row.quantity,
      unit_price: row.unit_price,
    }));

    // ✅ NEW: send email to supplier (non-blocking — won't fail the order if email fails)
    sendOrderEmail({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      order,
      items: emailItems,
    }).catch((err) => console.error("Email sending failed:", err));

    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: {
        order,
        items: orderItemsResult.rows,
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllOrders=async(req,res)=>{
  try{
    const result = await pool.query(`
      SELECT
        po.id,
        po.status,
        po.total_amt,
        po.order_date,
        po.updated_at,
        s.id         AS supplier_id,
        s.name       AS supplier_name,
        s.email      AS supplier_email,
        u.id         AS user_id,
        u.name       AS user_name,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'item_id',      oi.id,
            'product_id',   oi.product_id,
            'product_name', p.name,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price,
            'subtotal',     oi.quantity * oi.unit_price
          )
        ) AS items
      FROM purchase_orders po
      LEFT JOIN suppliers s  ON s.id = po.supplier_id
      LEFT JOIN users u      ON u.id = po.user_id
      LEFT JOIN order_items oi ON oi.order_id = po.id
      LEFT JOIN products p   ON p.id = oi.product_id
      GROUP BY po.id, s.id, u.id
      ORDER BY po.order_date DESC
    `);

    
return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        po.id,
        po.status,
        po.total_amt,
        po.order_date,
        po.updated_at,
        s.id          AS supplier_id,
        s.name        AS supplier_name,
        s.email       AS supplier_email,
        s.phone       AS supplier_phone,
        s.address     AS supplier_address,
        u.id          AS user_id,
        u.name        AS user_name,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'item_id',      oi.id,
            'product_id',   oi.product_id,
            'product_name', p.name,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price,
            'subtotal',     oi.quantity * oi.unit_price
          )
        ) AS items
      FROM purchase_orders po
      LEFT JOIN suppliers s    ON s.id = po.supplier_id
      LEFT JOIN users u        ON u.id = po.user_id
      LEFT JOIN order_items oi ON oi.order_id = po.id
      LEFT JOIN products p     ON p.id = oi.product_id
      WHERE po.id = $1
      GROUP BY po.id, s.id, u.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const receivedOrder=async(req,res)=>{
  try{
    const {id}=req.params
    const user_id=req.user.id

    const orderCheck=await pool.query('SELECT * FROM purchase_orders WHERE id=$1',[id])

    if(orderCheck.rows.length===0){
       return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderCheck.rows[0];

    if (order.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Order has already been received",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot receive a cancelled order",
      });
    }

    const orderItems = await pool.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [id]
    );

    // Update order status
    const updatedOrder = await pool.query(
      `UPDATE purchase_orders
       SET status = 'received', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // Increase product quantities and log stock transactions
    for (const item of orderItems.rows) {
      await pool.query(
        `UPDATE products
         SET quantity = quantity + $1, updated_at = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );

      const updatedProduct = await pool.query(
  `SELECT id, name, quantity, low_stock_threshold FROM products WHERE id = $1`,
  [item.product_id]
);

const updated = updatedProduct.rows[0];

if (updated.quantity <= updated.low_stock_threshold) {
  await sendEmail(
    process.env.NODE_MAILER_EMAIL,
    `Stock of product ${updated.name} is below threshold with quantity ${updated.quantity}`
  );
}

await pool.query(
  `INSERT INTO stock_transactions (product_id, user_id, type, quantity, note)
  VALUES ($1, $2, 'IN', $3, $4)`,
  [item.product_id, user_id, item.quantity, `Received from purchase order ${id}`]
);
}
    
      return res.status(200).json({
      success: true,
      message: "Order marked as received and stock updated",
      data: updatedOrder.rows[0],
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

export const cancelOrder=async(req,res)=>{
  try{
    const {id}=req.params
    const user_id=req.user.id

     const orderCheck = await pool.query(
      `SELECT * FROM purchase_orders WHERE id = $1`,
      [id]
    );

     if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderCheck.rows[0];

     if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

     if (order.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an already received order",
      });
    }

    const updatedOrder = await pool.query(
      `UPDATE purchase_order
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

     return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder.rows[0],
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