var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
  content: String,
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }
});

module.exports = mongoose.model("Task", taskSchema);
