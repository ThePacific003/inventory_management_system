import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./database/dbConnect.js";
import authroutes from "./routes/auth.routes.js"
import productRoutes from "./routes/product.routes.js"
import transactionRoutes from "./routes/stock.routes.js"
import supplierRoutes from "./routes/supplier.routes.js"
import categoryRoutes from './routes/category.routes.js'
import orderRoutes from './routes/order.routes.js'
import supplierProductRoutes from './routes/supplierproduct.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());




const startServer = async () => {
  try {
    await pool.query(`SELECT 1`); 
     console.log("PostgreSQL Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
  }
};

app.use("/api/auth",authroutes)
app.use("/api/products",productRoutes)
app.use("/api/transaction",transactionRoutes)
app.use("/api/supplier",supplierRoutes)
app.use("/api/category",categoryRoutes)
app.use("/api/orders",orderRoutes)
app.use("/api/supplierPro",supplierProductRoutes)
app.use("/api/dashboard",dashboardRoutes)

app.get("/print", (req, res) => {
  res.send("Welcome to the Inventory Management System API");
});
startServer();