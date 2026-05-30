import { param } from "express-validator";
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
      pool.query(`SELECT COUNT(*) FROM purchase_orders`),

      // pending orders
      pool.query(`SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending'`),

      // received orders
      pool.query(`SELECT COUNT(*) FROM purchase_orders WHERE status = 'received'`),

      // cancelled orders
      pool.query(`SELECT COUNT(*) FROM purchase_orders WHERE status = 'cancelled'`),

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
        FROM purchase_orders po
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

export const getStockMovements=async(req,res)=>{
    try{
        const {period='7'}=req.query
        const [dailyMovements, summary, topMovedProducts]=await Promise.all([

            //daily in/out quantities over the period
             pool.query(`
        SELECT
          DATE(created_at)        AS date,
          type,
          SUM(quantity)           AS total_quantity,
          COUNT(*)                AS transaction_count
        FROM stock_transactions
        WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
          AND type IN ('IN', 'OUT')
        GROUP BY DATE(created_at), type
        ORDER BY date ASC
      `),

       // overall summary for the period
      pool.query(`
        SELECT
          type,
          SUM(quantity)   AS total_quantity,
          COUNT(*)        AS transaction_count
        FROM stock_transactions
        WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
        GROUP BY type
      `),

       // top 5 most moved products
      pool.query(`
        SELECT
          p.id,
          p.name,
          SUM(CASE WHEN st.type = 'IN'  THEN st.quantity ELSE 0 END) AS total_in,
          SUM(CASE WHEN st.type = 'OUT' THEN st.quantity ELSE 0 END) AS total_out,
          COUNT(*) AS transaction_count
        FROM stock_transactions st
        LEFT JOIN products p ON p.id = st.product_id
        WHERE st.created_at >= NOW() - INTERVAL '${parseInt(period)} days'
        GROUP BY p.id, p.name
        ORDER BY transaction_count DESC
        LIMIT 5
      `)
        ])

         // reshape daily movements into { date, in, out } format
    const movementMap = {};
    dailyMovements.rows.forEach(({ date, type, total_quantity }) => {
      const key = date.toISOString().split('T')[0];
      if (!movementMap[key]) movementMap[key] = { date: key, in: 0, out: 0 };
      if (type === 'IN')  movementMap[key].in  = parseInt(total_quantity);
      if (type === 'OUT') movementMap[key].out = parseInt(total_quantity);
    });

    // build summary object { IN: {}, OUT: {}, ADJUSTMENT: {} }
    const summaryMap = {};
    summary.rows.forEach(({ type, total_quantity, transaction_count }) => {
      summaryMap[type] = {
        total_quantity: parseInt(total_quantity),
        transaction_count: parseInt(transaction_count)
      };
    });

     return res.status(200).json({
      success: true,
      data: {
        period_days: parseInt(period),
        summary: summaryMap,
        daily_movements: Object.values(movementMap),
        top_moved_products: topMovedProducts.rows,
      }
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

export const getLowStockItems=async(req,res)=>{
    try{
        const{threshold, category, supplier, page=1, limit=10 }=req.body
        const offset=(page-1)*limit

        let conditions=[`p.quantity<=p.low_stock_threshold`]

        let params =[]

        let paramCount=1

        //override threshold filter
        if(threshold){
            conditions.push(`p.quantity<=$${paramCount}`)
            params.push(parseInt(threshold))
            paramCount++
        }

        //filter by category
        if(category){
            conditions.push(`p.category_id=$${paramCount}`)
            params.push(category)
            paramCount++
        }

        //filter by supplier
        if(supplier){
            conditions.push(`p.supplier_id=$${paramCount}`)
            params.push(supplier)
            paramCount++
        }

        const whereClause=`WHERE ${conditions.join(' AND ')}`

        const [items, countResult, summary]=await Promise.all([
            //paginated low stock products
             pool.query(`
        SELECT
          p.id,
          p.name,
          p.quantity,
          p.low_stock_threshold,
          p.price,
          p.updated_at,
          c.id    AS category_id,
          c.name  AS category_name,
          s.id    AS supplier_id,
          s.name  AS supplier_name,
          s.email AS supplier_email,
          s.phone AS supplier_phone,
          CASE
            WHEN p.quantity = 0 THEN 'out_of_stock'
            ELSE 'low_stock'
          END AS status,
          (p.low_stock_threshold - p.quantity) AS units_needed
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN suppliers  s ON s.id = p.supplier_id
        ${whereClause}
        ORDER BY p.quantity ASC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `, [...params, parseInt(limit), parseInt(offset)]),


      //total count for pagination
      pool.query(
        `SELECT COUNT(*) FROM products p ${whereClause}`,params
      ),

      //summary breakdown
       pool.query(`
        SELECT
          COUNT(*)                                            AS total_low_stock,
          COUNT(*) FILTER (WHERE p.quantity = 0)             AS out_of_stock,
          COUNT(*) FILTER (WHERE p.quantity > 0)             AS low_but_available,
          COALESCE(SUM(p.low_stock_threshold - p.quantity), 0) AS total_units_needed
        FROM products p
        ${whereClause}
      `, params)

        ])

        const totalCount=countResult.rows[0].count
        const totalPages=Math.ceil(totalCount/parseInt(limit))

         return res.status(200).json({
      success: true,
      data: {
        summary: {
          total_low_stock:    parseInt(summary.rows[0].total_low_stock),
          out_of_stock:       parseInt(summary.rows[0].out_of_stock),
          low_but_available:  parseInt(summary.rows[0].low_but_available),
          total_units_needed: parseInt(summary.rows[0].total_units_needed),
        },
        items: items.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit:       parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        }
      }
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