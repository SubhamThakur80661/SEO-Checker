import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Magnetic from '../components/Magnetic';

const inputClass =
  'glass-input w-full px-4 py-3 border border-white/12 text-paper placeholder:text-smoke/50 focus:ring-2 focus:ring-lime/40 focus:border-lime/60 outline-none transition-all';

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
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-lime underline underline-offset-4 hover:text-paper">Sign in</Link></>}
    >
      {error && (
        <div className="mb-6 border border-red-400/30 bg-red-500/10 p-3.5 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">Name</label>
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
          <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">Email</label>
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
          <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">Password</label>
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

        <Magnetic className="mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-lime py-3.5 font-display text-base font-extrabold tracking-tight text-ink transition-colors hover:bg-paper disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <UserPlus size={19} />}
            Create account
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </Magnetic>
      </form>
    </AuthLayout>
  );
};

export default Signup;
