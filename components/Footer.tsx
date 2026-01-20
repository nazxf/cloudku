
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
        { name: 'Tentang Kami', href: '#features' }, // We'll add this ID to Features
        { name: 'Kontak Kami', href: 'https://wa.me/628123456789' },
        { name: 'Karier', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Afiliasi', href: '#' },
        { name: 'Testimonial', href: '#testimonials' } // We'll add this ID to Testimonials
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
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <div 
                className="flex items-center gap-2 mb-6 cursor-pointer w-fit group"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-8 h-8 bg-[#2d6cea] rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">HostModern</span>
              </div>
              <p className="mb-8 text-slate-400 max-w-sm">
                Misi kami adalah memberikan solusi web hosting yang terjangkau, cepat, dan aman bagi semua orang untuk membangun kehadiran online mereka.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { name: 'facebook', icon: 'fa-facebook-f' },
                  { name: 'twitter', icon: 'fa-x-twitter' },
                  { name: 'instagram', icon: 'fa-instagram' },
                  { name: 'linkedin', icon: 'fa-linkedin-in' },
                  { name: 'youtube', icon: 'fa-youtube' }
                ].map(s => (
                  <a key={s.name} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#2d6cea] transition-all hover:scale-110 group">
                    <span className="sr-only">{s.name}</span>
                    <i className={`fab ${s.icon} text-slate-400 group-hover:text-white transition-colors`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Cols */}
            {sections.map(section => (
              <div key={section.title}>
                <h4 className="text-white font-bold mb-6">{section.title}</h4>
                <ul className="space-y-4 text-sm">
                  {section.links.map(link => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="hover:text-[#2d6cea] transition-colors relative group/link"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2d6cea] transition-all group-hover/link:w-full"></span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        {/* Payments & Legal */}
        <div className="border-t border-slate-800 pt-10 mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap justify-center gap-4">
              {['Visa', 'Mastercard', 'PayPal', 'GOPAY', 'OVO', 'DANA', 'BCA', 'BNI'].map(p => (
                <div key={p} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-400">
                  {p}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-500 text-center lg:text-right">
              <p>&copy; {new Date().getFullYear()} HostModern Hosting International. Seluruh hak cipta dilindungi undang-undang.</p>
              <p className="mt-1">Dibuat dengan ❤️ untuk performa website terbaik.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
