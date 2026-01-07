import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, Zap, LogOut, Activity, X, Server, Hash } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import API_BASE_URL from './config';

// --- ENTERPRISE UTILS ---
function TechBorder({ children, className }) {
  return (
    <div className={`relative border border-zinc-800 bg-[#0a0a0a] ${className}`}>
        {/* Decorative Corner Markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#ccff00]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#ccff00]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#ccff00]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#ccff00]" />
        {children}
    </div>
  )
}

// --- DASHBOARD ---
function Dashboard() {
  const { token, logout, user } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [history, setHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedShortCode, setSelectedShortCode] = useState(null); 
  const [statsData, setStatsData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ url: longUrl }),
      });
      if(!response.ok) throw new Error("Service unavailable");
      const data = await response.json();
      fetchHistory(); 
      setLongUrl(''); 
    } catch (err) {
      setError('Connection refused by host.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async (code) => {
    if (!code) return;
    setSelectedShortCode(code);
    setLoadingStats(true);
    setShowAnalytics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/${code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) throw new Error("Unauthorized");
      const data = await response.json();
      setStatsData(data.length === 0 ? [{ time: 'Now', clicks: 0 }] : data);
    } catch (e) {
      console.error(e);
      setStatsData([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setHistory(prev => prev.map(item => item.id === id ? { ...item, copied: true } : item));
    setTimeout(() => {
        setHistory(prev => prev.map(item => item.id === id ? { ...item, copied: false } : item));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-[#ccff00] selection:text-black flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 w-full px-8 h-20 flex items-center justify-between border-b border-zinc-800 bg-[#050505]/80 backdrop-blur-sm">
        
        {/* LOGO LINK TO LANDING */}
        <Link to="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="w-8 h-8 bg-[#ccff00] rounded-sm flex items-center justify-center group-hover:bg-white transition-colors">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold tracking-tighter text-lg font-sans">
            LINKLET_OS <span className="text-zinc-600 ml-2 text-xs font-mono group-hover:text-[#ccff00] transition-colors">// DASHBOARD</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6 text-xs font-bold tracking-widest">
           <span className="text-zinc-500 uppercase">USR: <span className="text-[#ccff00]">{user}</span></span>
           <button onClick={logout} className="flex items-center gap-2 hover:text-white text-zinc-500 transition-colors uppercase">
             [ LOGOUT ] <LogOut className="w-3 h-3" />
           </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-16 px-6 pb-20 w-full max-w-5xl mx-auto">
        
        {/* Header Stats */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <StatCard label="Active Links" value={history.length} icon={<Server className="w-4 h-4 text-[#ccff00]"/>} />
            <StatCard label="System Status" value="ONLINE" icon={<Activity className="w-4 h-4 text-[#ccff00]"/>} />
            <StatCard label="Protocol" value="SECURE" icon={<Hash className="w-4 h-4 text-[#ccff00]"/>} />
        </div>

        {/* Input Area */}
        <TechBorder className="w-full mb-8 p-1">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row bg-[#050505]">
              <input
                type="url"
                required
                autoFocus
                placeholder="INPUT_TARGET_URL..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-grow bg-[#050505] text-[#ccff00] px-6 py-4 placeholder-zinc-700 outline-none font-mono text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 bg-zinc-900 hover:bg-[#ccff00] hover:text-black text-white font-bold text-xs uppercase tracking-widest transition-all border-l border-zinc-800 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isLoading ? 'PROCESSING...' : <>EXECUTE <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            {error && <div className="px-6 py-2 text-xs font-bold text-red-500 bg-red-500/5 border-t border-zinc-800">ERR: {error}</div>}
        </TechBorder>

        {/* Analytics Panel */}
        <AnimatePresence>
        {showAnalytics && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full mb-8 overflow-hidden">
            <TechBorder className="p-6">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                 <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">Traffic Analysis</h3>
                   <p className="text-xs text-zinc-500 font-mono mt-1">ID: {selectedShortCode}</p>
                 </div>
                 <button onClick={() => setShowAnalytics(false)} className="hover:text-[#ccff00] transition"><X className="w-5 h-5" /></button>
               </div>
               <div className="h-[250px] w-full">
                  {loadingStats ? (
                    <div className="w-full h-full flex items-center justify-center text-[#ccff00] text-xs uppercase animate-pulse">Fetching Data Stream...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsData}>
                        <defs>
                          <linearGradient id="acidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#ccff00', fontFamily: 'monospace' }} 
                            itemStyle={{ color: '#ccff00' }}
                        />
                        <Area type="step" dataKey="clicks" stroke="#ccff00" strokeWidth={2} fillOpacity={1} fill="url(#acidGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
               </div>
            </TechBorder>
          </motion.div>
        )}
        </AnimatePresence>

        {/* History Log */}
        <div className="w-full">
            <div className="flex justify-between items-end mb-4 px-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Event Log</span>
                <span className="text-[10px] text-zinc-600 font-mono">SYNCED</span>
            </div>
            
            <div className="space-y-1">
            <AnimatePresence>
            {history.map((link) => (
                <motion.div 
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group border border-zinc-800 bg-[#0a0a0a] hover:bg-[#0f0f0f] hover:border-zinc-700 p-3 flex items-center justify-between transition-all"
                >
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="text-zinc-600 font-mono text-[10px] min-w-[30px]">{new Date().getHours()}:{new Date().getMinutes()}</div>
                        <div className="flex flex-col overflow-hidden">
                             <a href={link.realUrl} target="_blank" className="text-sm font-bold text-[#ededed] hover:text-[#ccff00] transition truncate font-mono tracking-tight">{link.shortUrl}</a>
                             <span className="text-[10px] text-zinc-500 truncate max-w-[300px] font-mono">{link.original}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => fetchAnalytics(link.shortCode)} className="p-2 text-zinc-400 hover:text-[#ccff00] hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition" title="ANALYZE">
                            <Activity className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleCopy(link.id, link.realUrl)} className={`p-2 border border-transparent hover:border-zinc-700 transition ${link.copied ? 'text-[#ccff00] bg-[#ccff00]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`} title="COPY">
                            {link.copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4 flex justify-between items-start">
            <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
                <div className="text-2xl font-bold text-white font-sans">{value}</div>
            </div>
            {icon}
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

function AppRoutes() {
    const { token } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
    );
}

export default App;