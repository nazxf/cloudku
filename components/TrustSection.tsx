import React, { useEffect, useState, useRef } from 'react';

const TrustSection: React.FC = () => {
  const partners = [
    { name: 'Google Cloud', logo: 'https://www.vectorlogo.zone/logos/google_cloud/google_cloud-ar21.svg' },
    { name: 'DigitalOcean', logo: 'https://www.vectorlogo.zone/logos/digitalocean/digitalocean-ar21.svg' },
    { name: 'Cloudflare', logo: 'https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg' },
    { name: 'GitHub', logo: '/github-logo.png' },
    { name: 'Slack', logo: 'https://www.vectorlogo.zone/logos/slack/slack-ar21.svg' },
    { name: 'AWS', logo: 'https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-ar21.svg' },
    { name: 'Vercel', logo: 'https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg' },
  ];

  // Counting Animation Logic
  const [count, setCount] = useState(0);
  const targetCount = 10000;
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = targetCount;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="py-20 bg-white overflow-hidden border-b border-slate-100 relative">
      <div className="absolute inset-0 bg-slate-50/50 -z-10"></div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

          {/* Stats Part with Counting Animation */}
          <div ref={countRef} className="flex-shrink-0 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-200 pb-10 lg:pb-0 lg:pr-24 relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>

            <div className="flex items-center justify-center lg:justify-start gap-1 mb-3 relative z-10">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-5 h-5 text-amber-400 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <div className="relative">
              <p className="text-5xl font-[900] text-slate-900 mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                {count.toLocaleString('id-ID')}+
              </p>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start">
              <span className="w-8 h-px bg-slate-300"></span>
              User Terdaftar
            </p>
          </div>

          {/* Logos Part with Marquee */}
          <div className="flex-grow w-full overflow-hidden relative group">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center lg:text-left opacity-60">
              Infrastruktur Powerhouse
            </p>

            {/* Gradient Masks for Marquee fade effect */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white/80 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white/80 to-transparent z-20 pointer-events-none"></div>

            <div className="flex gap-16 marquee-track hover:pause-marquee">
              {/* Double the logos for seamless loop */}
              {[...partners, ...partners, ...partners].map((p, idx) => (
                <div key={`${p.name}-${idx}`} className="flex-shrink-0 h-10 lg:h-12 w-auto transition-all duration-300 hover:scale-110 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 cursor-pointer">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .hover\\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TrustSection;
