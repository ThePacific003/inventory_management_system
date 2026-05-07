import pool from "../database/dbConnect.js";
import { sendEmail } from "../nodemailer/nodemailer.js";

export const getAllSuppliers=async(req ,res)=>{
    try{
        const result=await pool.query(
        `
        SELECT s.id,s.name, s.email, s.phone, s.address,s.created_at,
        COUNT(DISTINCT p.id) AS total_products,
        COUNT (DISTINCT po.id) AS total_orders
        FROM suppliers s
         LEFT JOIN products p ON p.supplier_id = s.id
       LEFT JOIN purchase_orders po ON po.supplier_id = s.id
       GROUP BY s.id
       ORDER BY s.name ASC
        `
        )

        return res.status(200).json({
      success: true,
      count: result.rows.length,
      suppliers: result.rows,
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

export const getSupplierById=async(req,res)=>{
    try{
        const { id } = req.params;

        const supplier=await pool.query(`
            SELECT  
            s.id, s.name, s.email, s.phone, s.address, s.created_at,
            COUNT(DISTINCT p.id) AS total_products,
            COUNT (DISTINCT po.id) AS total_orders
            FROM suppliers s
            LEFT JOIN product p ON s.id=p.supplier_id
            LEFT JOIN purchase_orders po ON s.id=po.supplier_id
            WHERE s.id=$1
            GROUP BY s.id
            `,[id])

             if (supplier.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // all products supplied by this supplier
    const products = await pool.query(
      `SELECT
        p.id, p.name, p.price, p.quantity,
        p.low_stock_threshold, p.updated_at,
        c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.supplier_id = $1
       ORDER BY p.name ASC`,
      [id]
    );

    // all purchase orders placed with this supplier
    const orders = await pool.query(
      `SELECT
        po.id, po.status, po.total_amount, po.order_date, po.updated_at,
        u.name AS created_by
       FROM purchase_orders po
       LEFT JOIN users u ON po.user_id = u.id
       WHERE po.supplier_id = $1
       ORDER BY po.order_date DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      supplier: supplier.rows[0],
      products: products.rows,
      orders: orders.rows,
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

export const createSupplier=async(req,res)=>{
    try{
         const { name, email, phone, address } = req.body;

         if (!name || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const nameRegex = /^(?!\s+$)[a-zA-Z0-9\s&.-]{3,100}$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const phoneRegex = /^(?:\+977)?[0-9]{10}$/;

    const addressRegex = /^(?!\s+$)[a-zA-Z0-9\s,.-]{5,200}$/;

    const  parsedName=name?.trim();
    const parsedEmail=email?.trim()
    const  parsedPhone=phone?.trim()
    const parsedAddress=address?.trim()

     if(!nameRegex.test(parsedName)){
        return res.status(400).json({ message: "Invalid supplier name" });
     }

     if (!emailRegex.test(parsedEmail)) {
  return res.status(400).json({ message: "Invalid email" });
}

if (!phoneRegex.test(parsedPhone)) {
  return res.status(400).json({ message: "Invalid phone number" });
}

if (!addressRegex.test(parsedAddress)) {
  return res.status(400).json({ message: "Invalid address" });
}

 // check duplicate name
    const existingName = await pool.query(
      'SELECT id FROM suppliers WHERE LOWER(name) = LOWER($1)',
      [parsedName]
    );
 if (existingName.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Supplier with this name already exists' });
    }

    // check duplicate email if provided

      const existingEmail = await pool.query(
        'SELECT id FROM suppliers WHERE LOWER(email) = LOWER($1)',
        [parsedEmail])
     

    if (existingEmail.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Supplier with this email already exists' });
      }
    const result = await pool.query(
      `INSERT INTO suppliers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, address, created_at`,
      [parsedName, parsedEmail || null, parsedPhone || null, parsedAddress || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier: result.rows[0],
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

export const updateSupplier=async(req,res)=>{
    try{
       const { id } = req.params;
    const { name, email, phone, address } = req.body;

     if (!name && !email && !phone && !address) {
      return res.status(400).json({ success: false, message: 'At least one field is required to update' });
    }

     // check supplier exists
    const existing = await pool.query(
      'SELECT id FROM suppliers WHERE id = $1',
      [id]
    );

     if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // check duplicate name — exclude current supplier from check
    if (name) {
      const duplicateName = await pool.query(
        'SELECT id FROM suppliers WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name, id]
      );
    }


    if (duplicateName.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Supplier with this name already exists' });
      }

      // check duplicate email — exclude current supplier from check
    if (email) {
      const duplicateEmail = await pool.query(
        'SELECT id FROM suppliers WHERE LOWER(email) = LOWER($1) AND id != $2',
        [email, id]
      );

      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Supplier with this email already exists' });
      }
    }

    const updated = await pool.query(
      `UPDATE suppliers SET
        name    = COALESCE($1, name),
        email   = COALESCE($2, email),
        phone   = COALESCE($3, phone),
        address = COALESCE($4, address)
       WHERE id = $5
       RETURNING id, name, email, phone, address, created_at`,
      [name || null, email || null, phone || null, address || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier: updated.rows[0],
    });
    }


    catch(error){
        console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const deleteSupplier=async(req,res)=>{
    try{
         const { id } = req.params;

         // check supplier exists
    const existing = await pool.query(
      'SELECT id, name FROM suppliers WHERE id = $1',
      [id]
    );

     if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // block deletion if supplier has pending purchase orders
    const pendingOrders = await pool.query(
      `SELECT COUNT(*) FROM purchase_orders
       WHERE supplier_id = $1 AND status = 'pending'`,
      [id]
    );

     if (parseInt(pendingOrders.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with pending purchase orders. Cancel the orders first.',
      });
    }

    // count affected products before deletion
    const affectedProducts = await pool.query(
      'SELECT COUNT(*) FROM products WHERE supplier_id = $1',
      [id]
    );

    const count = parseInt(affectedProducts.rows[0].count);

    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: `Supplier "${existing.rows[0].name}" deleted successfully`,
      affected_products: count,
      note: count > 0
        ? `${count} product(s) have had their supplier set to NULL`
        : null,
    });
    }
    catch(error){
         console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
    }
}