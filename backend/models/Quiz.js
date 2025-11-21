const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true } // Array index
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  targetYear: { type: Number, min: 1, max: 4 }, // Faculty selects one year
  targetBranches: [{ type: String, enum: ['CSE', 'MNC', 'MAE', 'ECE'] }], // Faculty selects multiple branches
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
