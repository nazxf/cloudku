
import React from 'react';

const Footer: React.FC = () => {
  const sections = [
    {
      title: 'Layanan',
      links: [
        { name: 'Web Hosting', href: '#hosting' },
        { name: 'WordPress Hosting', href: '#hosting' },
        { name: 'Cloud Hosting', href: '#hosting' },
        { name: 'Email Hosting', href: '#hosting' },
        { name: 'Domain', href: '#domain' },
        { name: 'Website Builder', href: '#hosting' }
      ]
    },
    {
      title: 'Perusahaan',
      links: [
        { name: 'Tentang Kami', href: '#features' },
        { name: 'Kontak Kami', href: 'https://wa.me/628123456789' },
        { name: 'Karier', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Afiliasi', href: '#' },
        { name: 'Testimonial', href: '#testimonials' }
      ]
    },
    {
      title: 'Bantuan',
      links: [
        { name: 'Pusat Bantuan', href: '#faq' },
        { name: 'Tutorial', href: '#faq' },
        { name: 'Komunitas', href: '#faq' },
        { name: 'Ketentuan Layanan', href: '#' },
        { name: 'Kebijakan Privasi', href: '#' },
        { name: 'Sitemap', href: '#' }
      ]
    }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <footer className="bg-[#0b1120] text-slate-300 pt-32 pb-12 relative overflow-hidden font-sans border-t border-slate-800/80">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">

          {/* 1. Brand & Socials (Col Span 4) */}
          <div className="lg:col-span-4 lg:pr-12">
            <div
              className="flex items-center gap-3 mb-8 cursor-pointer w-fit group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-[800] text-white tracking-tight leading-none">HostModern</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Cloud Platform</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed mb-10 text-[15px] font-medium max-w-sm">
              Infrastruktur cloud berkinerja tinggi dengan teknologi NVMe SSD Gen 4 dan LiteSpeed Enterprise. Solusi terbaik untuk bisnis digital Anda.
            </p>

            <div>
              <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-5">Terhubung Dengan Kami</h5>
              <div className="flex gap-3">
                {[
                  { icon: 'fa-facebook-f', color: 'bg-[#1877F2]' },
                  { icon: 'fa-twitter', color: 'bg-black' },
                  { icon: 'fa-instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
                  { icon: 'fa-linkedin-in', color: 'bg-[#0077b5]' },
                  { icon: 'fa-youtube', color: 'bg-[#ff0000]' },
                ].map((social, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className={`absolute inset-0 ${social.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <i className={`fab ${social.icon} relative z-10`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Newsletter (Col Span 3) - Moved here as per user preference */}
          <div className="lg:col-span-3 lg:px-4">
            <h4 className="text-white font-bold text-lg mb-8">Berlangganan</h4>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Dapatkan update teknologi, promo eksklusif, dan tips bisnis langsung di inbox Anda.
            </p>
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="far fa-envelope text-slate-500 group-focus-within:text-blue-500 transition-colors"></i>
                </div>
                <input
                  type="email"
                  placeholder="Alamat Email Anda"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
              <button className="w-full bg-[#2d6cea] hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group">
                <span>Berlangganan Sekarang</span>
                <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </button>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 opacity-80">
                <i className="fas fa-shield-alt text-emerald-500"></i>
                Data Anda aman. Bebas spamming 100%.
              </p>
            </div>
          </div>

          {/* 3. Links Columns (Col Span 5 total) */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8 pt-2 lg:pt-0">
            {sections.map(section => (
              <div key={section.title}>
                <h4 className="text-white font-bold text-lg mb-8">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map(link => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="text-slate-400 hover:text-white transition-all duration-200 py-0.5 block font-medium hover:translate-x-1 flex items-center gap-2 group/link text-[15px]"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar items */}
        <div className="border-t border-slate-800 pt-10 mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-slate-500 text-sm font-medium">
                &copy; {new Date().getFullYear()} <span className="text-white font-bold">HostModern</span>. All rights reserved.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-3 text-xs font-semibold text-slate-500">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-400 transition-colors">SLA</a>
              </div>
            </div>

            {/* Payment Icons - Using FontAwesome and Custom Badges for 'Premium' look */}
            <div className="flex flex-col items-center lg:items-end gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metode Pembayaran</span>
              <div className="flex flex-wrap justify-center gap-2">
                {/* Global Cards */}
                <div className="flex gap-2">
                  <div className="w-10 h-7 bg-white rounded flex items-center justify-center text-blue-900 shadow-sm"><i className="fab fa-cc-visa text-2xl"></i></div>
                  <div className="w-10 h-7 bg-white rounded flex items-center justify-center text-red-600 shadow-sm"><i className="fab fa-cc-mastercard text-2xl"></i></div>
                  <div className="w-10 h-7 bg-white rounded flex items-center justify-center text-[#003087] shadow-sm"><i className="fab fa-cc-paypal text-2xl"></i></div>
                  <div className="w-10 h-7 bg-white rounded flex items-center justify-center text-[#0070ba] shadow-sm"><i className="fab fa-cc-amex text-2xl"></i></div>
                </div>

                {/* Divider */}
                <div className="w-px h-7 bg-slate-700 mx-1"></div>

                {/* Local Banks - Styled Text Pills */}
                <div className="flex gap-2">
                  <div className="h-7 px-2 bg-blue-700 items-center flex rounded text-[10px] font-black text-white italic tracking-tighter shadow-sm border border-blue-600">BCA</div>
                  <div className="h-7 px-2 bg-gradient-to-r from-blue-800 to-yellow-500 items-center flex rounded text-[10px] font-black text-white tracking-tight shadow-sm border border-blue-600">Mandiri</div>
                  <div className="h-7 px-2 bg-teal-600 items-center flex rounded text-[10px] font-black text-white tracking-widest shadow-sm border border-teal-500">BNI</div>
                  <div className="h-7 px-2 bg-blue-600 items-center flex rounded text-[10px] font-black text-white shadow-sm border border-blue-500">BRI</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
