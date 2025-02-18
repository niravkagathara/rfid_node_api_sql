const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors(
      origin: ["https://rfid-node-api-sql.vercel.app/"],  // Replace with frontend URL
    methods: ["GET", "POST"],
    credentials: true
));

// MySQL Database Connection
const db = mysql.createPool({
    host: "sql12.freesqldatabase.com",
    user: "sql12763373",
    password: "zDmQA9tVu5",
    database: "sql12763373",
    connectionLimit: 10 // Allow up to 10 connections

});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});

// Function to Insert or Update UID
async function insertUID(uid) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO latest_uid (uid) VALUES (?) ON DUPLICATE KEY UPDATE uid=?";
        db.query(sql, [uid, uid], (err, result) => {
            if (err) {
                console.error("Error updating UID:", err);
                return reject("Error updating UID");
            }

            // Delete older UIDs, keeping only the latest 1
            const deleteQuery = `DELETE FROM latest_uid WHERE id NOT IN (
                                    SELECT id FROM (
                                        SELECT id FROM latest_uid ORDER BY id DESC LIMIT 1
                                    ) AS temp
                                )`;
            db.query(deleteQuery, (deleteErr, deleteResult) => {
                if (deleteErr) {
                    console.error("Error deleting old UIDs:", deleteErr);
                    return reject("Error updating UID");
                }
                resolve("UID Updated Successfully");
            });
        });
    });
}

// Function to get latest UID
async function getLatestUID() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT uid FROM latest_uid ORDER BY id DESC LIMIT 1;";
        db.query(sql, (err, result) => {
            if (err) {
                return reject("Error fetching latest UID");
            }
            resolve(result.length > 0 ? result[0] : null);
        });
    });
}

// Function to get student by UID
async function getStudentByUID(uid) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM students WHERE uid = ?";
        db.query(sql, [uid], (err, result) => {
            if (err) {
                return reject("Error fetching student data");
            }
            resolve(result.length > 0 ? result[0] : null);
        });
    });
}

// Function to add attendance record
async function addAttendance(uid, student_id, status, date, time) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO attendance (uid, student_id, status, date, time) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [uid, student_id, status, date, time], (err, result) => {
            if (err) {
                return reject("Error inserting attendance");
            }
            resolve("Attendance recorded successfully");
        });
    });
}

// API Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Student API 🚀');
});

// Get Latest UID from MySQL
app.get('/rfid', async (req, res) => {
    try {
        const latestUid = await getLatestUID();
        res.status(200).send({ uid: latestUid ? latestUid.uid : null });
    } catch (error) {
        res.status(500).send({ error: error });
    }
});

// Handle RFID POST Request
app.post('/rfid', async (req, res) => {
    const { uid, msg } = req.body;

    if (uid) {
        try {
            // Check if student exists
            const student = await getStudentByUID(uid);

            // Insert the latest UID
            const insertUidResponse = await insertUID(uid);
            console.log("Latest UID Inserted");

            if (student) {
                const { uid, id: student_id, enrollment } = student;
                const status = "Present";
                const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
                const time = new Date().toLocaleTimeString(); // HH:MM:SS

                // Insert attendance record
                await addAttendance(uid, student_id, status, date, time);

                res.status(200).send({
                    status_code: 200,
                    message1: "    Present    ",
                    message2: enrollment
                });
            } else {
                res.status(200).send({ status_code: 301, message1: "", message2: "Not Allowed!" });
            }
        } catch (error) {
            res.status(500).send({ status_code: 500, message: error });
        }
    } else if (msg) {
        let response;
        switch (msg) {
            case "Student Record Added Successfully":
                response = { status_code: 302, message1: "Add new student", message2: "  Successfully  " };
                break;
            case "Student Record Updated Successfully":
                response = { status_code: 303, message1: "Student updated", message2: "  Successfully  " };
                break;
            default:
                response = { status_code: 304, message1: " Add or Update ", message2: "     Error     " };
        }
        res.status(200).send(response);
    } else {
        res.status(200).send({ status_code: 404, message1: "API error or system error", message2: "                " });
    }
});

// // Start the Express Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

module.exports = app;
