import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuestionForm from '../../components/QuestionForm/QuestionForm';
import Modal from '../../components/Modal/Modal';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetYear, setTargetYear] = useState(1);
  const [targetBranches, setTargetBranches] = useState(['CSE', 'MNC', 'MAE', 'ECE']); // Default all
  const [questions, setQuestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
    setModalOpen(false);
  };

  const handleBranchChange = (branch) => {
    if (targetBranches.includes(branch)) {
      setTargetBranches(targetBranches.filter(b => b !== branch));
    } else {
      setTargetBranches([...targetBranches, branch]);
    }
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!title || questions.length === 0) return setError('Quiz needs a title and at least one question.');
    if (targetBranches.length === 0) return setError('Select at least one branch.');
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/quizzes/create`, {
        title,
        description,
        questions,
        targetYear,
        targetBranches
      });
      setSuccess('Quiz created successfully!');
      // Redirect to faculty dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/faculty');
      }, 1500);
    } catch (e) {
      setError('Could not create quiz');
    }
    setLoading(false);
  };
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Quiz</h1>
      <form className="bg-white rounded-xl shadow p-6 flex flex-col gap-4" onSubmit={submitQuiz}>
        <div>
          <label className="block font-medium mb-1 text-gray-700">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-md"/>
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-md"/>
        </div>
        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="block font-medium mb-1 text-gray-700">Target Year</label>
            <select value={targetYear} onChange={e=>setTargetYear(Number(e.target.value))} className="w-full px-4 py-2 border rounded-md">
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="w-2/3">
            <label className="block font-medium mb-1 text-gray-700">Target Branches</label>
            <div className="flex flex-wrap gap-2">
              {['CSE', 'MNC', 'MAE', 'ECE'].map(b => (
                <label key={b} className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={targetBranches.includes(b)} onChange={()=>handleBranchChange(b)} />
                  {b}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <span className="block font-medium mb-2 text-gray-700">Questions</span>
          {questions.length === 0 && <div className="text-gray-500">No questions yet</div>}
          <ul className="mb-2">
            {questions.map((q,i)=>(<li key={i} className="py-1">{q.questionText} (Options: {q.options.length})</li>))}
          </ul>
          <button type="button" className="bg-indigo-600 text-white px-4 py-1 rounded shadow font-bold" onClick={()=>setModalOpen(true)}>Add Question</button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-700">{success}</div>}
        <button className="bg-green-600 hover:bg-green-700 text-white transition py-2 rounded-lg font-bold mt-2" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</button>
      </form>
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)}>
        <QuestionForm onSubmit={addQuestion} />
      </Modal>
    </div>
  );
}
