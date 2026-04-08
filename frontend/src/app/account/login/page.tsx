'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
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
      { theme: 'outline', size: 'large', width: '100%', text: 'continue_with', shape: 'rectangular' }
    );
  };

  const handleGoogleCallback = async (response: { credential: string }) => {
    setGoogleLoading(true);
    try {
      const res = await authApi.googleAuth(response.credential);
      const { user, token, is_new_user } = res.data.data;
      setAuth(user, token);
      syncWishlist();
      toast.success(is_new_user ? `Welcome to HastKala, ${user.name}!` : `Welcome back, ${user.name}!`);
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
      syncWishlist();
      toast.success(`Welcome${mode === 'register' ? ' to HastKala' : ' back'}, ${user.name}!`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
            HastKala<span style={{ color: '#B68868' }}>✦</span>
          </h1>
          <p className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: '#903E1D' }}>
            Handmade Craft Since 2020
          </p>
        </div>

        {/* Card */}
        <div style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>

          {/* Mode tabs */}
          <div className="flex" style={{ borderBottom: '1px solid #EBEBCA' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
                style={{
                  backgroundColor: mode === m ? '#642308' : 'transparent',
                  color: mode === m ? '#FAF9EE' : '#903E1D',
                  borderRight: m === 'login' ? '1px solid #EBEBCA' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Google Button */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-4">
                  {googleLoading ? (
                    <div className="w-full h-11 flex items-center justify-center gap-2 text-sm"
                      style={{ border: '1px solid #EBEBCA', color: '#903E1D' }}>
                      <Loader2 size={14} className="animate-spin" />
                      Signing in with Google...
                    </div>
                  ) : (
                    <div id="google-btn" className="w-full flex justify-center" />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#EBEBCA' }} />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: '#B68868' }}>
                    or continue with email
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#EBEBCA' }} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                  <input
                    type="text" required placeholder="Full Name"
                    value={form.name} onChange={e => set('name', e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-sm outline-none transition-colors"
                    style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                <input
                  type="email" required placeholder="Email Address"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm outline-none transition-colors"
                  style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                />
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                  <input
                    type="tel" placeholder="Phone Number (optional)"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-sm outline-none transition-colors"
                    style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                  />
                </div>
              )}

              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                <input
                  type={showPw ? 'text' : 'password'} required placeholder="Password"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full pl-9 pr-10 py-3 text-sm outline-none transition-colors"
                  style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#B68868' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#642308'); }}
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin" />
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'login' && (
              <p className="text-center text-xs mt-4" style={{ color: '#B68868' }}>
                <a href="#" className="hover:underline" style={{ color: '#903E1D' }}>Forgot your password?</a>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] mt-5" style={{ color: '#B68868' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
