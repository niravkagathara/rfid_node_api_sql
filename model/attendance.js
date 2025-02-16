const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["Present", "Absent", "Pending", ""], default: "Pending" },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    date_time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
