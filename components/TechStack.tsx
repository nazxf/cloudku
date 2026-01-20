
import React from 'react';

const TechStack: React.FC = () => {
  const techs = [
    { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
    { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
    { name: 'Laravel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg' },
    { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
    { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'Go', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg' },
    { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
    { name: 'Redis', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
  ];

  // Double the items for seamless infinite scroll
  const scrollItems = [...techs, ...techs];

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 mb-12 text-center">
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Mendukung Teknologi Modern</p>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">Siap Untuk Framework Pilihan Anda</h2>
      </div>

      <div className="relative flex">
        {/* Infinite Scroll Container */}
        <div className="flex animate-scroll whitespace-nowrap gap-8 items-center py-4">
          {scrollItems.map((tech, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-default group h-16"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img 
                  src={tech.icon} 
                  alt={tech.name} 
                  className="max-w-full max-h-full grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 object-contain" 
                />
              </div>
              <span className="text-base font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); } 
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: fit-content;
          display: flex;
        }
        .relative:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TechStack;
