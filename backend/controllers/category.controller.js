import { json } from "express";
import pool from "../database/dbConnect.js";
import { sendEmail } from "../nodemailer/nodemailer.js";

export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT c.id,c.name, c.description, c.created_at,
            COUNT (p.id) AS total_products
            FROM categories c
            LEFT JOIN products p ON c.id=p.category_id  
            GROUP BY c.id
            ORDER BY c.name ASC
            `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      categories: result.rows,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    //trim name
    const parsedName = name?.trim();

    if (!parsedName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (parsedName.length < 3 && parsedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category name must be between 3 and 50 characters",
      });
    }
    // 4. Format validation (letters, numbers, spaces, hyphens only)
    const nameRegex = /^[A-Za-z0-9\s-]+$/;

    if (!nameRegex.test(parsedName)) {
      return res.status(400).json({
        success: false,
        message:
          "Category name can only contain letters, numbers, spaces, and hyphens",
      });
    }

    //check duplicate
    const existing = await pool.query(
      "SELECT id FROM categories WHERE LOWER(name)=LOWER($1)",
      [parsedName],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const result = await pool.query(
      `
                INSERT INTO categories (name,description) VALUES ($1,$2) RETURNING id,name,description,created_at 
            `,
      [parsedName, description || null],
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one field is required to update",
        });
    }

    const existing = await pool.query(`SELECT id FROM categories WHERE id=$1`, [
      id,
    ]);

    if (existing.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // check duplicate name — exclude current category from check
    if (name) {
      const duplicate = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2",
        [name, id],
      );

      if (duplicate.rows.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Category name already exists" });
      }
    }
    const updated = await pool.query(
      `
        UPDATE categories SET 
        name=COALESCE($1,name),
        descRiption=COALESCE($2,description)
        WHERE id=$3
        RETURNING id,name,description,created_at
        `,
      [name || null, description || null, id],
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updated.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCategory=async(req,res)=>{
    try{
         const { id } = req.params;

         // check category exists
         const existing=await pool.query(`SELECT id,name FROM categories WHERE id=$1`,[id])

         if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    //warn how many products will be affected
    const affectedProducts=await pool.query(`
        SELECT COUNT (*) FROM products WHERE category_id=$1
        `,[id])
          const count = parseInt(affectedProducts.rows[0].count);
          await pool.query(`DELETE FROM products WHERE category_id=$1`,[id]);
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);


          return res.status(200).json({
      success: true,
      message: `Category ${existing.rows[0].name} deleted successfully`,
      affected_products: count,
      note: count > 0
        ? `${count} product(s) are also deleted since product category is deleted`
        : null,
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

export const getCategoryById=async(req,res)=>{
    try{
        const {id}=req.params

        const category=await pool.query(`
            SELECT c.id, c.name, c.description, c.created_at,
            COUNT (p.id) AS total_products
            FROM categories c
            LEFT JOIN products p ON c.id=p.category_id
            WHERE c.id=$1
            GROUP BY c.id
            `,[id])

            if (category.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    //fetch  all products belonging to this category
    const products=await pool.query(`
        SELECT
        p.id, p.name, p.price, p.quantity,
        p.low_stock_threshold, p.updated_at,
        s.name AS supplier_name
        FROM products p 
        LEFT JOIN suppliers s 
        ON p.supplier_id=s.id
        WHERE p.category_id=$1
        ORDER BY p.name ASC
        `,[id])

      return res.status(200).json({
      success: true,
      category: category.rows[0],
      products: products.rows,
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