var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }
  ],
  ownedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  hasAccess: [
    String
  ]
});

module.exports = mongoose.model("List", listSchema);
