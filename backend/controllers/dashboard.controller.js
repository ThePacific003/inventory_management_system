import pool from "../database/dbConnect.js";

export const getDashboardStats=async(req,res)=>{
    try{
        const [
      totalProducts,
      totalSuppliers,
      totalOrders,
      pendingOrders,
      receivedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      recentTransactions,
      recentOrders,
      topLowStockItems,
    ]=await Promise.all([
        //total products
        pool.query(`SELECT COUNT(*) FROM products`),

        //total suppliers
        pool.query(`SELECT COUNT(*) FROM suppliers`),

         // total orders
      pool.query(`SELECT COUNT(*) FROM purchase_order`),

      // pending orders
      pool.query(`SELECT COUNT(*) FROM purchase_order WHERE status = 'pending'`),

      // received orders
      pool.query(`SELECT COUNT(*) FROM purchase_order WHERE status = 'received'`),

      // cancelled orders
      pool.query(`SELECT COUNT(*) FROM purchase_order WHERE status = 'cancelled'`),

      // low stock products (quantity <= threshold but not zero)
      pool.query(`
        SELECT COUNT(*) FROM products
        WHERE quantity <= low_stock_threshold AND quantity > 0
      `),

      // out of stock products
      pool.query(`SELECT COUNT(*) FROM products WHERE quantity = 0`),

      // total stock value (quantity * price)
      pool.query(`SELECT COALESCE(SUM(quantity * price), 0) AS total FROM products`),

      // recent 5 stock transactions
      pool.query(`
        SELECT
          st.id,
          st.type,
          st.quantity,
          st.note,
          st.created_at,
          p.name  AS product_name,
          u.name  AS user_name
        FROM stock_transactions st
        LEFT JOIN products p ON p.id = st.product_id
        LEFT JOIN users u    ON u.id = st.user_id
        ORDER BY st.created_at DESC
        LIMIT 5
      `),

      // recent 5 orders
      pool.query(`
        SELECT
          po.id,
          po.status,
          po.total_amt,
          po.order_date,
          s.name AS supplier_name
        FROM purchase_order po
        LEFT JOIN suppliers s ON s.id = po.supplier_id
        ORDER BY po.order_date DESC
        LIMIT 5
      `),

      // top 5 low stock items
      pool.query(`
        SELECT
          id,
          name,
          quantity,
          low_stock_threshold
        FROM products
        WHERE quantity <= low_stock_threshold
        ORDER BY quantity ASC
        LIMIT 5
      `)
    ])

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          total_products:        parseInt(totalProducts.rows[0].count),
          total_suppliers:       parseInt(totalSuppliers.rows[0].count),
          total_orders:          parseInt(totalOrders.rows[0].count),
          total_stock_value:     parseFloat(totalStockValue.rows[0].total),
        },
        orders: {
          pending:   parseInt(pendingOrders.rows[0].count),
          received:  parseInt(receivedOrders.rows[0].count),
          cancelled: parseInt(cancelledOrders.rows[0].count),
        },
        stock: {
          low_stock:    parseInt(lowStockProducts.rows[0].count),
          out_of_stock: parseInt(outOfStockProducts.rows[0].count),
        },
        recent_transactions: recentTransactions.rows,
        recent_orders:       recentOrders.rows,
        top_low_stock_items: topLowStockItems.rows,
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