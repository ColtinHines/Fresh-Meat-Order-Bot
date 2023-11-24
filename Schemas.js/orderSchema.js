const { Schema, model } = require("mongoose");

let orderSchema = new Schema({
  Guild: String,
  Category: String,
});

module.exports = model("ordSchema", orderSchema);
