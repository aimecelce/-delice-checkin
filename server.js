const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// ADMIN LOGIN DETAILS (from .env)
// =====================================
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";

// =====================================
// MIDDLEWARE
// =====================================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// =====================================
// ROOT ROUTE - FIX FOR RAILWAY
// =====================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// =====================================
// MYSQL CONNECTION
// =====================================
let db;

if (process.env.DATABASE_URL) {
    db = mysql.createConnection(process.env.DATABASE_URL);
    console.log("🔗 Using Railway MySQL");
} else {
    db = mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "delice_checkin",
        port: process.env.DB_PORT || 3306
    });
    console.log("🔗 Using Local MySQL");
}

// =====================================
// CONNECT TO DATABASE
// =====================================
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        return;
    }
    console.log("✅ Connected to Delice Check-in database!");
    
    const createTable = `
        CREATE TABLE IF NOT EXISTS checkins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mood VARCHAR(50) NOT NULL,
            day_answer TEXT NOT NULL,
            feeling TEXT NOT NULL,
            ate VARCHAR(50) NOT NULL,
            rest VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTable, (err) => {
        if (err) {
            console.error("❌ Error creating table:", err.message);
        } else {
            console.log("✅ Checkins table ready");
        }
    });
});

// =====================================
// TEST API
// =====================================
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Delice Check-in API is working!"
    });
});

// =====================================
// SAVE CHECK-IN
// =====================================
app.post("/api/checkin", (req, res) => {
    console.log("📥 CHECK-IN RECEIVED");
    console.log("Body:", req.body);

    const { mood, dayAnswer, feeling, ate, rest } = req.body;

    if (!mood || !dayAnswer || !feeling || !ate || !rest) {
        return res.status(400).json({
            success: false,
            message: "All answers are required."
        });
    }

    const sql = `
        INSERT INTO checkins (mood, day_answer, feeling, ate, rest)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [mood, dayAnswer, feeling, ate, rest], (err, result) => {
        if (err) {
            console.error("❌ Error saving check-in:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not save the check-in."
            });
        }

        console.log("✅ Check-in saved! ID:", result.insertId);
        res.json({
            success: true,
            message: "Check-in saved successfully!",
            id: result.insertId
        });
    });
});

// =====================================
// ADMIN LOGIN
// =====================================
app.post("/api/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return res.json({
            success: true,
            message: "Login successful."
        });
    }

    res.status(401).json({
        success: false,
        message: "Incorrect username or password."
    });
});

// =====================================
// GET ALL CHECK-INS
// =====================================
app.get("/api/checkins", (req, res) => {
    const sql = `
        SELECT id, mood, day_answer, feeling, ate, rest, created_at
        FROM checkins
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error getting check-ins:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not load check-ins."
            });
        }

        res.json({
            success: true,
            checkins: results
        });
    });
});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, "0.0.0.0", () => {
    console.log("=================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📱 Delice: http://localhost:${PORT}/index.html`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin-login.html`);
    console.log("=================================");
});