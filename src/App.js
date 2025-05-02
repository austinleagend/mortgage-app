
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(null);
  const [quizData, setQuizData] = useState({ credit: 0, income: 0, savings: 0, employment: 0, docs: 0 });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const handleLogin = () => signInWithEmailAndPassword(auth, email, password);
  const handleSignup = () => createUserWithEmailAndPassword(auth, email, password);
  const handleLogout = () => signOut(auth);

  const handleSubmit = async () => {
    const totalScore =
      Number(quizData.credit) +
      Number(quizData.income) +
      Number(quizData.savings) +
      Number(quizData.employment) +
      Number(quizData.docs);

    await addDoc(collection(db, 'users', user.uid, 'scores'), {
      ...quizData,
      totalScore,
      createdAt: new Date(),
    });

    setScore(totalScore);
  };

  if (!user) {
    return (
      <div className="p-10 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Login or Sign Up</h1>
        <input
          className="block border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="block border p-2 w-full mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 mr-2" onClick={handleLogin}>Login</button>
        <button className="bg-green-600 text-white px-4 py-2" onClick={handleSignup}>Sign Up</button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mortgage Readiness Quiz</h1>
      <p className="mb-4">Welcome, {user.email}</p>
      <button className="mb-6 bg-red-600 text-white px-4 py-2" onClick={handleLogout}>Logout</button>

      {['credit', 'income', 'savings', 'employment', 'docs'].map((field) => (
        <div className="mb-4" key={field}>
          <label className="block mb-1 font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            type="number"
            min="0"
            max="30"
            className="border p-2 w-full"
            value={quizData[field]}
            onChange={(e) => setQuizData({ ...quizData, [field]: e.target.value })}
          />
        </div>
      ))}

      <button className="bg-blue-600 text-white px-4 py-2" onClick={handleSubmit}>
        Submit Quiz
      </button>

      {score !== null && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h2 className="text-xl font-bold">Your Score: {score}/100</h2>
          {score >= 90 && <p className="text-green-700">✅ You're mortgage-ready!</p>}
          {score >= 70 && score < 90 && <p className="text-yellow-700">🟡 Almost there!</p>}
          {score < 70 && <p className="text-red-700">🔴 Needs improvement.</p>}
        </div>
      )}
    </div>
  );
}
