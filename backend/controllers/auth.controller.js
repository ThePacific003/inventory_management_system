import pool from "../database/dbConnect.js";
import bcrypt, { setRandomFallback } from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import transporter, { sendEmail } from "../nodemailer/nodemailer.js";
import jwt from "jsonwebtoken";
import { matchedData } from "express-validator";
import { createDiffieHellmanGroup } from "crypto";
//register user and send OTP to email
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid name (only letters, 2-50 chars)",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number, special character and be at least 6 characters long",
      });
    }

    const userCount = await pool.query(`SELECT COUNT(*) FROM users`);
    const count = parseInt(userCount.rows[0].count);
    if (count > 0) {
      return res.status(403).json({
        success: false,
        message: "Registration is closed",
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    const pendingToken = jwt.sign(
      { name, email, hashedPassword, otp: OTP },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.cookie("pending_user", pendingToken, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    await transporter.verify()
    console.log("SMTP connected")
    await sendEmail(email, `Your OTP is ${OTP}`);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//verify OTP and create user
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    //extracting cookie named pending_user
    const pendingToken = req.cookies.pending_user;

    if (!pendingToken) {
      return res
        .status(400)
        .json({ success: false, message: "No pending registration found" });
    }
    //decode token
    let decoded;

    try {
      decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch (error) {
        res.clearCookie('pending_user')
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    //otp compare
    if (decoded.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;
    const role = isFirstUser ? "admin" : "staff";

    //create user
    const newUser = await pool.query(
      "INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name, email, role, created_at",
      [decoded.name, decoded.email, decoded.hashedPassword, role],
    );

    const user = newUser.rows[0];
    //generate final token
    const authToken = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    //clear pending cookie
    res.clearCookie("pending_user");

    await sendEmail(user.email, `You are now officially registered in Godaam`);

    return res
      .cookie("token", authToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(201)
      .json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//login
export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    //getuser
    const userRows = await pool.query(`SELECT * FROM users WHERE email=$1 `, [
      email,
    ]);

    //check user
    if (userRows.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userRows.rows[0];

    //compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === "production",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//get my profile (protected)
export const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );

    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: user.rows[0] });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//create staff by admin
export const createStaffByAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExists = await pool.query(`SELECT id FROM users WHERE email=$1`, [
      email
    ]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email ,password_hash,role) VALUES ($1,$2,$3,'staff') RETURNING id,name,email,role`,
      [name, email, hashedPassword],
    );

    await sendEmail(email, "Your staff account created in godaam");

    return res.status(200).json({
      success: true,
      message: "Staff account created successfully",
      users: newUser.rows[0],
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get all users by admin only
export const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
      // ← was missing comma between role and created_at
    )
    return res.status(200).json({
      success: true,
      users: users.rows,
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

//delete user protected and admin only
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    //prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//forgot password
export const forgotPassword=async(req,res)=>{
    try{    
        const {email}=req.body

        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
            })
        }

        const user=await pool.query("SELECT id FROM users WHERE email=$1",[email])

        //always return success - never reveal if email exists since people may enter fake email

        if(user.rows.length===0){
            return res.status(400).json({
                success:false,
                message:"If this email exists, OTP has been sent to corresponding email"
            })
        }

        const OTP=Math.floor(100000+Math.random()*900000).toString();

        const resetToken=jwt.sign({
            id:user.rows[0].id,email,OTP
        },process.env.JWT_SECRET,{expiresIn:'10m'})

        res.cookie('reset_token', resetToken, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
    });

    await sendEmail(email, OTP)

        return res.status(200).json({
            success:true,
            message:"If this email exists, an OTP has been sent"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//Reset password - verify OTP to set new password(public)
export const verifyResetOtp=async(req,res)=>{
    try{
        const {otp}=req.body;

        if(!otp){
            return res.status(400).json({
                success:false,
                message:"OTP is required"
            })
        }

        const resetToken=req.cookies.reset_token

         if (!resetToken) {
      return res.status(400).json({ success: false, message: 'No reset request found. Please request OTP again.' });
    }

     let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      
      
    } catch (err) {
      res.clearCookie('reset_token');
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (decoded.OTP !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    // OTP is correct — clear the reset_token cookie
    res.clearCookie('reset_token');

     // Issue a short-lived verified cookie carrying only the user id
    // This proves OTP was verified without re-checking it on the next step
    const verifiedToken = jwt.sign(
      { id: decoded.id, email: decoded.email, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }  // 5 minutes to enter new password
    );

    res.cookie('verified_reset', verifiedToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified. You can now set a new password.',
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


//reset password (public) only reachable after verifyResetOtp sets the verified cookie
export const resetPw=async(req,res)=>{
    try{
        const {newPassword , confirmPassword}=req.body;
        
        if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Both fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must have uppercase, lowercase, number, special character, min 6 chars' });
    }
      // Check verified cookie — proves user passed OTP check
    const verifiedToken = req.cookies.verified_reset;
    if (!verifiedToken) {
      return res.status(403).json({ success: false, message: 'OTP not verified. Please verify OTP first.' });
    }

     let decoded;
    try {
      decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      res.clearCookie('verified_reset');
      return res.status(400).json({ success: false, message: 'Session expired. Please start again.' });
    }
    if (!decoded.verified) {
      return res.status(403).json({ success: false, message: 'OTP not verified.' });
    }

     // Check user still exists in DB
    const user = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    res.clearCookie('verified_reset');

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });

    }
    catch(error){
         console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
    }
}
