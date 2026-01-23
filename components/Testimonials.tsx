import React, { useEffect, useState, useRef } from 'react';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-slate-50 overflow-hidden relative" id="testimonials">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-1.5 bg-amber-100/50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-amber-100">
              Kata Mereka
            </div>
            <h2 className="text-4xl md:text-5xl font-[900] text-slate-900 mb-6 tracking-tight">
              Dipercaya oleh <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Ribuan Bisnis</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed">
              Bergabunglah dengan mereka yang telah sukses membangun kehadiran online dengan performa server terbaik.
            </p>
          </div>

          {/* Social Proof Stats */}
          <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i + 40}/100/100`} className="w-14 h-14 rounded-full border-[3px] border-white object-cover" alt="User" />
              ))}
              <div className="w-14 h-14 rounded-full border-[3px] border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                +2k
              </div>
            </div>
            <div>
              <div className="flex text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-base font-bold text-slate-900">4.9/5 Rata-rata Rating</p>
            </div>
          </div>
        </div>

        {/* 3D Carousel Area */}
        <div className="relative h-[500px] w-full perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center">
            {TESTIMONIALS.map((t, idx) => {
              // Calculate position relative to active index
              let position = idx - activeIndex;
              if (position < 0) position += TESTIMONIALS.length;
              if (position > TESTIMONIALS.length / 2) position -= TESTIMONIALS.length;

              const isActive = idx === activeIndex;
              const isPrev = position === -1;
              const isNext = position === 1;
              const isVisible = Math.abs(position) <= 1;

              if (!isVisible && !isActive) return null;

              return (
                <div
                  key={t.id}
                  className={`absolute w-full max-w-lg transition-all duration-700 ease-out cursor-pointer ${isActive ? 'z-30 scale-100 opacity-100 translate-x-0' :
                      isPrev ? 'z-20 scale-90 opacity-40 -translate-x-[60%]' :
                        'z-20 scale-90 opacity-40 translate-x-[60%]'
                    }`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative group overflow-hidden ${isActive ? 'shadow-2xl ring-4 ring-blue-50' : ''}`}>
                    {/* Quote mark decoration */}
                    <div className="absolute top-6 right-8 text-slate-100 text-[120px] font-serif leading-none opacity-50 select-none group-hover:text-blue-50 transition-colors duration-500">
                      "
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-1 text-amber-400 mb-8">
                        {[...Array(t.rating)].map((_, i) => (
                          <svg key={i} className="w-6 h-6 fill-current drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>

                      <p className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed mb-10 line-clamp-4">
                        {t.comment}
                      </p>

                      <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-white relative z-10" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-[#2d6cea] transition-colors">{t.name}</h4>
                          <p className="text-slate-500 font-bold text-sm tracking-wide">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Controls */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-10 bg-[#2d6cea]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
