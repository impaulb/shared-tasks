var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  title: String,
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }
  ],
  ownedBy: String,
  hasAccess: [
    String
  ]
});

module.exports = mongoose.model("List", listSchema);
