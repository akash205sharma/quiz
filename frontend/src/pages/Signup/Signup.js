import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { HiUserAdd } from "react-icons/hi";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [year, setYear] = useState(1);
  const [branch, setBranch] = useState("CSE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    if (password.length < 6) { setErr("Password too short."); setLoading(false); return; }
    try {
      await signup(name, email, password, role, role === 'student' ? year : undefined, role === 'student' ? branch : undefined);
      navigate("/dashboard");
    } catch {
      setErr("Signup failed. Use a different email?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-white">
      <form onSubmit={submit} className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col items-center mb-2">
          <span className="bg-indigo-50 p-3 rounded-full mb-1">
            <HiUserAdd className="text-3xl text-indigo-600" />
          </span>
          <h2 className="text-2xl font-bold text-indigo-700">Create Account</h2>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Name
          </label>
          <input required value={name} onChange={e=>setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Role
          </label>
          <select required value={role} onChange={e=>setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
        {role === 'student' && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Year</label>
              <select value={year} onChange={e=>setYear(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg">
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Branch</label>
              <select value={branch} onChange={e=>setBranch(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {['CSE', 'MNC', 'MAE', 'ECE'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Email
          </label>
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Password
          </label>
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300 transition" />
        </div>
        {err && <div className="bg-red-100 text-red-600 px-3 py-2 rounded">{err}</div>}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white transition text-lg font-semibold py-2 rounded-lg shadow"
          disabled={loading}
        >
          {loading ? "Creating..." : "Signup"}
        </button>
        <div className="text-center text-gray-600 mt-1">
          Existing user?{" "}
          <Link to="/login" className="text-indigo-500 hover:underline font-semibold">Login</Link>
        </div>
      </form>
    </div>
  );
}
