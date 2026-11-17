import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-sand bg-white text-olivewood placeholder:text-bark/50 focus:ring-2 focus:ring-sage/40 focus:border-sage outline-none transition-all';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account. Try again in a bit.');
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="An account keeps your audits and keyword searches in one place."
      footer={<>Already have an account? <Link to="/login" className="text-moss font-semibold hover:underline">Sign in</Link></>}
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-olivewood mb-1.5">Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-olivewood mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-olivewood mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full bg-olivewood hover:bg-moss disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <UserPlus size={19} />}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
