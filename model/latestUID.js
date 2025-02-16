const mongoose = require("mongoose");

const LatestUIDSchema = new mongoose.Schema({
    uid: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("LatestUID", LatestUIDSchema);
