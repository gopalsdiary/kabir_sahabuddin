import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[160px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Gallery</span>
        </button>

        <div className="bg-white border border-black/5 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--primary)]/20">
              <ShieldCheck size={32} className="text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">Admin Portal</h1>
            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-[var(--text-dim)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/[0.03] border border-transparent focus:border-[var(--primary)] rounded-2xl py-4 pl-14 pr-6 transition-all focus:outline-none placeholder:text-black/10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-[var(--text-dim)]">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/[0.03] border border-transparent focus:border-[var(--primary)] rounded-2xl py-4 pl-14 pr-6 transition-all focus:outline-none placeholder:text-black/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl text-center border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:gap-5 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-black/5 text-center space-y-2">
            <p className="text-[9px] text-[var(--text-dim)]/40 font-bold uppercase tracking-widest leading-loose">
              Free for personal use • Handcrafted by Gopal's Diary
            </p>
            <p className="text-[10px] text-[var(--text-dim)] font-bold">
              "এই রকম এপ বিল্ড করার জন্য <span className="text-black font-black">Gopals Diary</span> এর সাথে যোগাযোগ করুণ।"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
