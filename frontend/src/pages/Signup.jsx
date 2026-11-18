import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../lib/api";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { LogoMark } from "../components/layout/Sidebar.jsx";

export default function Signup() {
  const { register, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const asGuest = async () => {
    setGuestBusy(true);
    setError("");
    try {
      await guestLogin();
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGuestBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white">RankVista</h1>
          <p className="mt-1 text-sm text-sidebar-muted">See your site the way search engines do.</p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-xl sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink">Create your account</h2>
          <p className="mt-1 text-sm text-muted">Save audits, track scores, and share reports.</p>

          <Button variant="acid" size="lg" className="mt-6 w-full" onClick={asGuest} disabled={guestBusy || busy}>
            {guestBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserRound className="h-4 w-4" aria-hidden />}
            {guestBusy ? "Starting guest session…" : "Continue as Guest"}
          </Button>
          <p className="mt-2 text-center text-[13px] text-muted">
            No account needed — try a full audit as a guest.
          </p>

          <div className="my-6 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-medium uppercase tracking-wide text-faint">or with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              id="signup-name"
              label="Name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              id="signup-email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              id="signup-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              hint="At least 6 characters."
            />
            {error && (
              <p className="rounded-lg bg-critical-soft px-3 py-2.5 text-sm text-critical" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy || guestBusy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
