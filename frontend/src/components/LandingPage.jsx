import { motion } from 'framer-motion';
import { ArrowUpRight, Database, Zap, Lock, Server, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- ANIMATION VARIANTS ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVar = {
  hidden: { y: 50, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] relative overflow-hidden font-mono">
      
      {/* ATMOSPHERIC LAYERS */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none mix-blend-overlay" />
      <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-[#ccff00] blur-[150px] opacity-[0.05] rounded-full pointer-events-none mix-blend-screen" />

      {/* NAVBAR */}
      <nav className="relative z-50 w-full px-8 py-8 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="text-xl font-bold tracking-tighter font-sans">LINKLET_OS <span className="text-[#ccff00] text-xs align-top">DEV</span></Link>
        <div className="flex items-center gap-8 text-sm">
          <span className="hidden md:block text-zinc-600">// SYSTEM_READY</span>
          <Link to="/login" className="hover:text-[#ccff00] transition-colors decoration-wavy underline-offset-4 hover:underline">ACCESS_TERMINAL</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 px-6 pt-12 md:pt-24 pb-32 max-w-[1400px] mx-auto">
        <motion.div variants={containerVar} initial="hidden" animate="show">
            {/* BIG TYPE */}
            <div className="overflow-hidden mb-4">
              <motion.h1 variants={itemVar} className="text-[12vw] md:text-[130px] leading-[0.85] font-black font-sans tracking-tighter text-white mix-blend-difference">
                CONTROL <br/>
                THE <span className="text-transparent stroke-text" style={{ WebkitTextStroke: '2px #ccff00' }}>FLOW.</span>
              </motion.h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-16 border-t border-zinc-800 pt-12">
                <motion.div variants={itemVar} className="md:col-span-5 space-y-8">
                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-sans max-w-md">
                        A high-performance URL shortening infrastructure. 
                        Engineered for observability and speed using modern Java architecture.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/login" className="group relative px-8 py-4 bg-[#ccff00] text-black font-bold font-sans tracking-tight hover:bg-white transition-colors">
                            <span>LAUNCH INSTANCE</span>
                            <ArrowUpRight className="absolute top-3 right-3 w-5 h-5 group-hover:rotate-45 transition-transform" />
                        </Link>
                        <div className="px-8 py-4 border border-zinc-800 text-zinc-400 font-mono text-sm flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            <span>Build: Stable</span>
                        </div>
                    </div>
                </motion.div>

                {/* TECH STACK STATS */}
                <motion.div variants={itemVar} className="md:col-span-7 grid grid-cols-2 gap-4">
                    <StatBox label="CORE ENGINE" value="Spring Boot" icon={<Server className="w-4 h-4 text-[#ccff00]"/>} />
                    <StatBox label="DATA STORE" value="Postgres" icon={<Database className="w-4 h-4 text-[#ccff00]"/>} />
                    <StatBox label="CACHING LAYER" value="Redis" icon={<Zap className="w-4 h-4 text-[#ccff00]"/>} />
                    <StatBox label="AUTH PROTOCOL" value="JWT / BCrypt" icon={<Lock className="w-4 h-4 text-[#ccff00]"/>} />
                </motion.div>
            </div>
        </motion.div>
      </main>

      {/* MARQUEE */}
      <div className="border-y border-zinc-800 bg-[#0a0a0a] py-6 overflow-hidden relative">
        <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap text-zinc-700 font-sans font-bold text-4xl opacity-60"
        >
            <span>JAVA 21</span><span className="text-[#ccff00]">///</span>
            <span>TYPE SAFE</span><span className="text-[#ccff00]">///</span>
            <span>CLICKHOUSE ANALYTICS</span><span className="text-[#ccff00]">///</span>
            <span>DOCKER CONTAINERIZED</span><span className="text-[#ccff00]">///</span>
            <span>RESTFUL API</span><span className="text-[#ccff00]">///</span>
            <span>REACT 18</span><span className="text-[#ccff00]">///</span>
        </motion.div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }) {
    return (
        <div className="border border-zinc-800 p-6 hover:bg-zinc-900 transition-colors group">
            <div className="flex justify-between items-start mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-xs tracking-widest font-mono text-[#ccff00]">{label}</span>
                {icon}
            </div>
            <div className="text-2xl md:text-3xl font-sans font-bold text-white group-hover:text-[#ccff00] transition-colors">
                {value}
            </div>
        </div>
    )
}