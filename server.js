const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

require("dotenv").config();
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================
// ADMIN LOGIN DETAILS
// =====================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));


// =====================================
// MYSQL CONNECTION
// =====================================

const db = mysql.createConnection({

    host: process.env.DB_HOST || "localhost",

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "delice_checkin",

    port: process.env.DB_PORT || 3306

});


// =====================================
// CONNECT TO DATABASE
// =====================================

db.connect((err) => {

    if (err) {

        console.error(
            "Database connection failed:"
        );

        console.error(
            err.message
        );

        return;

    }

    console.log(
        "Connected to Delice Check-in database!"
    );

});


// =====================================
// TEST API
// =====================================

app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message:
            "Delice Check-in API is working!"

    });

});


// =====================================
// SAVE CHECK-IN
// =====================================

app.post("/api/checkin", (req, res) => {

    console.log(
        "CHECK-IN REQUEST RECEIVED"
    );

    console.log(
        req.body
    );


    const {

        mood,

        dayAnswer,

        feeling,

        ate,

        rest

    } = req.body;


    if (

        !mood ||
        !dayAnswer ||
        !feeling ||
        !ate ||
        !rest

    ) {

        return res.status(400).json({

            success: false,

            message:
                "All answers are required."

        });

    }


    const sql = `

        INSERT INTO checkins

        (
            mood,
            day_answer,
            feeling,
            ate,
            rest
        )

        VALUES (?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [
            mood,
            dayAnswer,
            feeling,
            ate,
            rest
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Error saving check-in:"
                );

                console.error(
                    err.message
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Could not save the check-in."

                });

            }


            console.log(
                "New check-in saved. ID:",
                result.insertId
            );


            res.json({

                success: true,

                message:
                    "Check-in saved successfully!",

                id:
                    result.insertId

            });

        }

    );

});


// =====================================
// ADMIN LOGIN
// =====================================

app.post("/api/admin-login", (req, res) => {

    const {

        username,

        password

    } = req.body;


    if (

        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD

    ) {

        return res.json({

            success: true,

            message:
                "Login successful."

        });

    }


    res.status(401).json({

        success: false,

        message:
            "Incorrect username or password."

    });

});


// =====================================
// GET ALL CHECK-INS
// =====================================

app.get("/api/checkins", (req, res) => {

    const sql = `

        SELECT

            id,

            mood,

            day_answer,

            feeling,

            ate,

            rest,

            created_at

        FROM checkins

        ORDER BY created_at DESC

    `;


    db.query(

        sql,

        (err, results) => {

            if (err) {

                console.error(
                    "Error getting check-ins:"
                );

                console.error(
                    err.message
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Could not load check-ins."

                });

            }


            res.json({

                success: true,

                checkins: results

            });

        }

    );

});


// =====================================
// START SERVER
// =====================================

app.listen(

    PORT,

    () => {

        console.log(
            "================================="
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );

    }

);