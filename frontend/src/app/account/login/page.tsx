'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

declare global {
  interface Window { google?: any; }
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const syncWishlist = useWishlistStore(s => s.syncFromDB);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ── Load Google Identity script ─────────────────────────
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogle(clientId);
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, []);

  const initGoogle = (clientId: string) => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
      auto_select: false,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
      }
    );
  };

  const handleGoogleCallback = async (response: { credential: string }) => {
    setGoogleLoading(true);
    try {
      const res = await authApi.googleAuth(response.credential);
      const { user, token, is_new_user } = res.data.data;
      setAuth(user, token);
      syncWishlist(); // load DB wishlist in background
      toast.success(is_new_user ? `Welcome to Lumière, ${user.name}! 💍` : `Welcome back, ${user.name}! 💍`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      syncWishlist(); // load DB wishlist in background
      toast.success(`Welcome${mode === 'register' ? ' to Lumière' : ' back'}, ${user.name}! 💍`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-charcoal mb-2">
            Lumière<span className="text-yellow-600">✦</span>
          </h1>
          <p className="text-gray-500 text-sm">Fine Jewelry for Every Moment</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-8">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google Button */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="mb-4">
                {googleLoading ? (
                  <div className="w-full h-11 bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Signing in with Google...
                  </div>
                ) : (
                  <div id="google-btn" className="w-full flex justify-center" />
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" required placeholder="Full Name"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" required placeholder="Email Address"
                value={form.email} onChange={e => set('email', e.target.value)}
                className={inputClass}
              />
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" placeholder="Phone Number (optional)"
                  value={form.phone} onChange={e => set('phone', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'} required placeholder="Password"
                value={form.password} onChange={e => set('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors"
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full btn-gold py-4 rounded-xl font-semibold text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <a href="#" className="text-yellow-700 hover:underline">Forgot your password?</a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
