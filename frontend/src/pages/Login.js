import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Loader2, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-sand bg-white text-olivewood placeholder:text-bark/50 focus:ring-2 focus:ring-sage/40 focus:border-sage outline-none transition-all';

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
      footer={<>No account yet? <Link to="/signup" className="text-moss font-semibold hover:underline">Create one</Link></>}
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full bg-olivewood hover:bg-moss disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={19} />}
          Sign in
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-sand/70"></div>
        <span className="text-xs font-medium text-bark uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-sand/70"></div>
      </div>

      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={isSubmitting}
        className="w-full bg-white hover:bg-paper disabled:opacity-60 text-olivewood font-semibold py-3 rounded-xl border border-sand transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 size={19} className="animate-spin" /> : <User size={19} />}
        Continue as Guest
      </button>
      <p className="mt-3 text-center text-sm text-bark">
        Just looking around? A guest session works without an account.
      </p>
    </AuthLayout>
  );
};

export default Login;
