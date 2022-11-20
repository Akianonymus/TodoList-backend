const mongoose = require("mongoose");

const TodoTaskSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date,
  },
});

module.exports =
  mongoose.model.TodoTask || mongoose.model("TodoTask", TodoTaskSchema);
