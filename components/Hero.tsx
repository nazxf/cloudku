import React, { useState, useRef, useEffect } from 'react';
import { checkDomain, type DomainCheckResult } from '../utils/domainChecker';

type DomainResult = DomainCheckResult;

interface HeroProps {
  onOpenAuth: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const [domain, setDomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [error, setError] = useState('');
  const [typingText, setTypingText] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Typing animation phrases
  const phrases = ['Website Masa Depan', 'Bisnis Online Sukses', 'Project Next-Gen', 'Toko Online Laris'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        setTypingText(currentPhrase.substring(0, typingText.length - 1));
        setTypingSpeed(50);
      } else {
        setTypingText(currentPhrase.substring(0, typingText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && typingText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && typingText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typingText, isDeleting, phraseIndex, typingSpeed, phrases]);

  const validateDomain = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Silakan masukkan nama domain';
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!trimmed.includes('.') || !domainRegex.test(trimmed)) {
      return 'Format domain tidak valid (misal: bisnissaya.com)';
    }
    return null;
  };

  const performCheck = async (targetDomain: string) => {
    const validationError = validateDomain(targetDomain);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsChecking(true);
    setResult(null);

    try {
      const data = await checkDomain(targetDomain);
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    } catch (err) {
      console.error('Domain check error:', err);
      setError('Gagal mengecek domain. Silakan coba lagi.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden" id="domain">
      {/* Premium Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-[#0f172a] -z-20"></div>
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute -bottom-32 left-20 w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[100px] animate-pulse"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-blue-200 text-xs font-bold mb-8 backdrop-blur-md hover:bg-white/10 transition-all cursor-default tracking-wider uppercase animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Promo Terbatas: Diskon 75% + Domain Gratis
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-[800] text-white mb-6 leading-[1.1] tracking-tight drop-shadow-xl animate-fade-in-up animation-delay-100">
              Hosting Tercepat <br className="hidden lg:block" /> untuk <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 typing-cursor">
                {typingText}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-fade-in-up animation-delay-200">
              Platform cloud hosting premium dengan teknologi <span className="text-white font-bold">NVMe Gen 4</span> & <span className="text-white font-bold">Litespeed Enterprise</span>. Performa maksimal mulai dari <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-lg font-bold border border-blue-500/30">Rp 10.900/bln</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-16 animate-fade-in-up animation-delay-300">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-2xl text-lg hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                Mulai Sekarang
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-2xl text-lg hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Lihat Demo
              </button>
            </div>
          </div>

          {/* Right Visuals - Floating elements */}
          <div className="hidden lg:block flex-1 relative h-[500px] w-full animate-fade-in-up animation-delay-500">
            {/* Main Mockup Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[280px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-20 overflow-hidden transform hover:scale-105 transition-all duration-500 group">
              {/* Fake UI Header */}
              <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              {/* Fake UI Body with Chart */}
              <div className="p-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Visitors</div>
                    <div className="text-3xl font-black text-white">842.9k</div>
                  </div>
                  <div className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">+12.5%</div>
                </div>
                {/* Visual Chart Bars */}
                <div className="flex items-end gap-3 h-32 mt-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/50 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-indigo-400 group-hover:h-[110%]" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Card 1 - Server Speed */}
            <div className="absolute top-0 right-10 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20 animate-float-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Speed</div>
                  <div className="text-xl font-black text-white">0.3s</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2 - Uptime */}
            <div className="absolute bottom-10 left-0 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20 animate-float-delayed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Uptime</div>
                  <div className="text-xl font-black text-white">99.99%</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full z-0 animate-spin-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full z-0 animate-spin-reverse-slow"></div>
          </div>
        </div>

        {/* Domain Search - Elevated Glassmorphism */}
        <div className="max-w-4xl mx-auto mt-10 md:mt-20 relative z-30">
          <form
            onSubmit={(e) => { e.preventDefault(); performCheck(domain); }}
            className="p-2 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-2 transition-all duration-500 backdrop-blur-xl border border-white/10 bg-white/5 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex-grow flex items-center px-6 relative z-10">
              <svg className="w-6 h-6 text-slate-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                placeholder="Cari nama domain impian (misal: bisnissaya.com)"
                className="w-full py-5 text-white outline-none placeholder:text-slate-400 bg-transparent text-xl font-bold"
                disabled={isChecking}
              />
            </div>
            <button
              type="submit"
              disabled={isChecking}
              className="bg-white text-slate-900 hover:bg-blue-50 font-extrabold py-5 px-10 rounded-[2rem] transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center min-w-[180px] text-lg relative z-10"
            >
              {isChecking ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Mengecek...
                </span>
              ) : 'Cek Domain'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-rose-500/90 backdrop-blur-xl text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-rose-400/30">
              <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-bold">{error}</span>
            </div>
          )}

          {/* Results Area */}
          <div ref={resultRef}>
            {result && (
              <div className="mt-12 bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in-up text-left border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="p-10 md:p-14">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-4xl font-black text-slate-900">{result.domain}</h3>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${result.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {result.status === 'available' ? 'Tersedia' : 'Terdaftar'}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium mb-3">
                        {result.status === 'available'
                          ? 'Domain premium untuk branding bisnis Anda.'
                          : 'Domain ini sudah terdaftar.'}
                      </p>

                      {/* WHOIS Info */}
                      {result.status === 'taken' && result.registrar && (
                        <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Informasi WHOIS
                          </h5>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                              <span className="text-slate-500 font-medium">Registrar</span>
                              <span className="font-bold text-slate-900">{result.registrar}</span>
                            </div>
                            {result.createdDate && (
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-medium">Terdaftar</span>
                                <span className="font-bold text-slate-900">{new Date(result.createdDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {result.expiryDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Kadaluarsa</span>
                                <span className="font-bold text-slate-900">{new Date(result.expiryDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {result.status === 'available' && (
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-right min-w-[280px]">
                        <div className="text-sm text-slate-500 font-bold mb-1">Mulai dari</div>
                        <div className="text-4xl font-black text-blue-600 mb-6">{result.price}</div>
                        <button onClick={onOpenAuth} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2">
                          Beli Sekarang
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 2s; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse-slow { animation: spin-reverse-slow 15s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .typing-cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </section>
  );
};

export default Hero;