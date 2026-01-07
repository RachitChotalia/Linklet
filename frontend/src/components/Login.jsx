import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Terminal, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(typeof data === 'string' ? data : data.message || 'Authentication failed');

      if (isLogin) {
        login(data.token);
      } else {
        setIsLogin(true);
        setError('USER_CREATED. PLEASE AUTHENTICATE.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] flex items-center justify-center p-4 relative font-mono overflow-hidden">
        
      {/* Background Layers */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      {/* RETURN TO LANDING PAGE LINK */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
            to="/" 
            className="group flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#ccff00] transition-colors uppercase tracking-widest"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            [ RETURN_ROOT ]
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 p-8 relative z-10 shadow-[0_0_50px_-12px_rgba(204,255,0,0.1)]"
      >
        {/* Terminal Header */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-[#ccff00]">
                <Terminal className="w-5 h-5" />
                <span className="font-bold tracking-wider text-sm">SECURE_GATEWAY</span>
            </div>
            <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
            </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mb-1 uppercase">
            {isLogin ? 'Authenticate' : 'Initialize User'}
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            {isLogin ? '// Enter credentials to access infrastructure' : '// Register new operator ID'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">User ID / Email</label>
            <input 
                type="text" 
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all placeholder-zinc-700"
                placeholder="operator@system.local"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">Passcode</label>
            <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all placeholder-zinc-700"
                placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">ERROR: {error.toUpperCase()}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ededed] hover:bg-[#ccff00] text-black font-bold py-4 text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group mt-4"
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'ACCESS SYSTEM' : 'CREATE ID')} 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-800 pt-6">
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-zinc-500 text-xs hover:text-[#ccff00] transition-colors font-mono"
            >
                {isLogin ? "[ SWITCH TO REGISTRATION ]" : "[ BACK TO LOGIN ]"}
            </button>
        </div>
      </motion.div>
    </div>
  );
}