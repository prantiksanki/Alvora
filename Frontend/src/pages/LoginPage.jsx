import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await authService.login(form.email, form.password);
      login({ user: { _id: data._id, name: data.name, email: data.email }, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c09] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative overflow-hidden bg-linear-to-br from-[#c9b99a]/10 to-[#0d0c09]">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute w-96 h-96 bg-[#c9b99a]/12 rounded-full blur-3xl top-1/4 left-1/4"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ repeat: Infinity, duration: 8, delay: 2 }}
          className="absolute w-64 h-64 bg-[#E1E0CC]/8 rounded-full blur-3xl bottom-1/3 right-1/4"
        />
        <div className="relative z-10 text-center px-8">
          <h1 className="text-5xl font-bold text-[#E1E0CC] mb-4">Alvora</h1>
          <p className="text-lg max-w-xs" style={{ color: '#9c9a8e' }}>
            Your developer journey, visualized.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-3xl font-bold text-[#E1E0CC]">Alvora</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#E1E0CC]">Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: '#9c9a8e' }}>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#9c9a8e' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-[#c9b99a] hover:text-[#E1E0CC] font-medium transition-colors">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs mt-4" style={{ color: '#6b6960' }}>
            <Link to="/" className="hover:text-[#9c9a8e] transition-colors">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
