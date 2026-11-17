import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Loader2, User, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Magnetic from '../components/Magnetic';

const inputClass =
  'glass-input w-full px-4 py-3 border border-white/12 text-paper placeholder:text-smoke/50 focus:ring-2 focus:ring-lime/40 focus:border-lime/60 outline-none transition-all';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, guestLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign you in. Check your email and password and try again.');
    }
    setIsSubmitting(false);
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await guestLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Guest sign-in failed. Try again in a bit.');
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to run audits and pick up where you left off."
      footer={<>No account yet? <Link to="/signup" className="font-semibold text-lime underline underline-offset-4 hover:text-paper">Create one</Link></>}
    >
      {error && (
        <div className="mb-6 border border-red-400/30 bg-red-500/10 p-3.5 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>

        <Magnetic className="mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-lime py-3.5 font-display text-base font-extrabold tracking-tight text-ink transition-colors hover:bg-paper disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={19} />}
            Sign in
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </Magnetic>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/12"></div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">or</span>
        <div className="h-px flex-1 bg-white/12"></div>
      </div>

      <Magnetic>
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isSubmitting}
          className="glass-soft flex w-full items-center justify-center gap-2 border border-white/20 py-3.5 font-display text-base font-bold tracking-tight text-paper transition-colors hover:border-lime hover:text-lime disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <User size={19} />}
          Continue as Guest
        </button>
      </Magnetic>
      <p className="mt-3 text-center text-sm text-smoke">
        Just looking around? A guest session works without an account.
      </p>
    </AuthLayout>
  );
};

export default Login;
