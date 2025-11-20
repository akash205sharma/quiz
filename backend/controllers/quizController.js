const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { sendQuizPublishedEmail } = require('../utils/emailService');

// Create Quiz (faculty only)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const quiz = new Quiz({
      title,
      description,
      facultyId: req.user.id,
      questions: questions || [] // Accept questions array if provided
    });
    await quiz.save();
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Quiz creation failed', error: err.message });
  }
};

// Edit Quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    quiz.title = req.body.title || quiz.title;
    quiz.description = req.body.description || quiz.description;
    await quiz.save();
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Quiz update failed', error: err.message });
  }
};

// Delete Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Quiz delete failed', error: err.message });
  }
};

// Publish/Unpublish Quiz
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const previousStatus = quiz.status;
    quiz.status = quiz.status === 'published' ? 'draft' : 'published';
    await quiz.save();

    // Send email if status changed to published
    if (previousStatus !== 'published' && quiz.status === 'published') {
      const students = await User.find({ role: 'student' });
      sendQuizPublishedEmail(students, quiz);
    }

    res.json({ status: quiz.status });
  } catch (err) {
    res.status(500).json({ message: 'Publish toggle failed', error: err.message });
  }
};

// List Quizzes (faculty: theirs, students: published only)
exports.listQuizzes = async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'faculty') {
      quizzes = await Quiz.find({ facultyId: req.user.id });
    } else {
      quizzes = await Quiz.find({ status: 'published' });
    }
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: 'List quizzes failed', error: err.message });
  }
};

// Add Question (faculty only)
exports.addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    const { questionText, options, correctAnswer } = req.body;
    if (!questionText || !options || typeof correctAnswer !== 'number')
      return res.status(400).json({ message: 'Invalid question fields' });
    quiz.questions.push({ questionText, options, correctAnswer });
    await quiz.save();
    res.status(201).json({ questions: quiz.questions });
  } catch (err) {
    res.status(500).json({ message: 'Add question failed', error: err.message });
  }
};

// Update Question
exports.updateQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    const { questionIndex, questionText, options, correctAnswer } = req.body;
    let q = quiz.questions[questionIndex];
    if (!q) return res.status(404).json({ message: 'Question not found' });
    q.questionText = questionText || q.questionText;
    q.options = options || q.options;
    if (typeof correctAnswer === 'number') q.correctAnswer = correctAnswer;
    await quiz.save();
    res.json({ questions: quiz.questions });
  } catch (err) {
    res.status(500).json({ message: 'Update question failed', error: err.message });
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    const { questionIndex } = req.body;
    quiz.questions.splice(questionIndex, 1);
    await quiz.save();
    res.json({ questions: quiz.questions });
  } catch (err) {
    res.status(500).json({ message: 'Delete question failed', error: err.message });
  }
};

// Get Quiz for Taking (student, omits answers)
exports.takeQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || quiz.status !== 'published') return res.status(404).json({ message: 'Quiz not found or not published' });
    const questions = quiz.questions.map(q => ({ questionText: q.questionText, options: q.options }));
    res.json({ quizId: quiz._id, title: quiz.title, description: quiz.description, questions });
  } catch (err) {
    res.status(500).json({ message: 'Fetch quiz failed', error: err.message });
  }
};

// Submit Quiz (student)
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{questionIndex, selectedOption}]
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || quiz.status !== 'published') return res.status(404).json({ message: 'Quiz not found/published' });
    let score = 0;
    quiz.questions.forEach((q, i) => {
      const answer = answers.find(a => a.questionIndex === i);
      if (answer && answer.selectedOption === q.correctAnswer) score++;
    });
    await new Submission({
      quizId: quiz._id,
      studentId: req.user.id,
      answers,
      score,
    }).save();
    res.json({ message: 'Quiz submitted', score });
  } catch (err) {
    res.status(500).json({ message: 'Quiz submit failed', error: err.message });
  }
};

// Faculty: View Submissions
exports.getSubmissions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id))
      return res.status(403).json({ message: 'Not authorized' });
    const subs = await Submission.find({ quizId: quiz._id }).populate('studentId', 'name email');
    res.json({ submissions: subs });
  } catch (err) {
    res.status(500).json({ message: 'Get submissions failed', error: err.message });
  }
};

// Analytics for Quiz (faculty only)
exports.quizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || (req.user.role !== 'faculty' || quiz.facultyId.toString() !== req.user.id))
      return res.status(403).json({ message: 'Not authorized' });
    const subs = await Submission.find({ quizId: quiz._id });
    if (!subs || subs.length === 0) return res.json({ info: 'No submissions yet' });
    const scores = subs.map(s => s.score);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const avg = (scores.reduce((sum, x) => sum + x, 0) / scores.length).toFixed(1);
    // Question-wise correct %
    const questionWise = quiz.questions.map((q, i) => {
      const correct = subs.filter(s => s.answers[i] && s.answers[i].selectedOption === q.correctAnswer).length;
      return {
        questionText: q.questionText,
        correctPercent: Math.round((correct / subs.length) * 100)
      };
    });
    res.json({ highest, lowest, avg, questionWise, total: subs.length });
  } catch (err) {
    res.status(500).json({ message: 'Analytics failed', error: err.message });
  }
};

exports.getQuizAnalysis = exports.quizAnalytics;

// Get Student's Own Result
exports.getMyResult = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || quiz.status !== 'published') return res.status(404).json({ message: 'Quiz not found' });
    const submission = await Submission.findOne({ quizId: quiz._id, studentId: req.user.id }).sort({ submittedAt: -1 });
    if (!submission) return res.json({ message: 'No submission found', score: null });

    // Return detailed result with questions, correct answers, and student answers
    const detailedQuestions = quiz.questions.map((q, index) => {
      const studentAnswer = submission.answers.find(a => a.questionIndex === index);
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        studentAnswer: studentAnswer ? studentAnswer.selectedOption : null,
        isCorrect: studentAnswer ? studentAnswer.selectedOption === q.correctAnswer : false
      };
    });

    res.json({
      score: submission.score,
      submittedAt: submission.submittedAt,
      totalQuestions: quiz.questions.length,
      questions: detailedQuestions,
      quizTitle: quiz.title
    });
  } catch (err) {
    res.status(500).json({ message: 'Get result failed', error: err.message });
  }
};