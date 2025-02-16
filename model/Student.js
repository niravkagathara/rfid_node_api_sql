const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enrollment: { type: String, required: true, unique: true },
    rollno: { type: Number, required: true },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    batch: { type: String, required: true },
    division: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);
// const StudentSchema = new mongoose.Schema({
//     uid: { type: String, required: true, unique: true, trim: true },
//     name: { type: String, required: true, trim: true },
//     enrollment: { 
//         type: String, 
//         required: true, 
//         unique: true,
//         match: /^[0-9]{12}$/ // Example: 12-digit number constraint
//     },
//     rollno: { type: Number, required: true, min: 1 },
//     semester: { type: Number, required: true, min: 1, max: 8 }, // Assuming 8 semesters
//     branch: { type: String, required: true, trim: true },
//     batch: { type: String, required: true, trim: true },
//     division: { type: String, required: true, trim: true, enum: ["A", "B", "C", "D"] } // Assuming divisions are limited
// }, { timestamps: true });
