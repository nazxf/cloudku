
import React from 'react';

const Features: React.FC = () => {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden" id="features">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Kenapa Memilih Kami?
          </div>
          <h2 className="text-4xl md:text-5xl font-[900] text-slate-900 mb-6 tracking-tight">
            Teknologi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Next-Gen</span> untuk <br /> Performa Maksimal
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Kami menggabungkan hardware terbaik dengan software optimasi canggih untuk memastikan website Anda selalu ngebut.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

          {/* Feature 1: NVMe SSD (Large) */}
          <div className="md:col-span-6 lg:col-span-7 p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Server NVMe SSD Gen 4</h3>
              <p className="text-slate-500 leading-relaxed text-lg mb-8">Penyimpanan generasi terbaru dengan kecepatan transfer data hingga 7000MB/s. Loading website 20x lebih cepat dibanding hosting HDD biasa.</p>

              {/* Speed Bar Visual */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs font-bold text-slate-400 w-24">NVMe Gen 4</span>
                  <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[95%]"></div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">7000 MB/s</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 w-24">SATA SSD</span>
                  <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 w-[40%]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">550 MB/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: SSL (Tall) */}
          <div className="md:col-span-6 lg:col-span-5 p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[2.5rem] shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-3xl font-black mb-4">SSL Gratis Selamanya</h3>
                <p className="text-indigo-100 leading-relaxed text-lg">Keamanan tingkat tinggi dengan enkripsi 256-bit. Google menyukai website yang aman, peringkat SEO Anda akan meningkat drastis.</p>
              </div>
              <div className="mt-8 flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm font-bold">Connection Secure</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Backup (Medium) */}
          <div className="md:col-span-6 lg:col-span-4 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Backup Harian</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Data Anda aman dari kejadian tak terduga. Kami simpan copy website Anda setiap hari ke server terpisah.</p>
          </div>

          {/* Feature 4: WP Optimized (Medium) */}
          <div className="md:col-span-6 lg:col-span-4 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">WordPress Optimized</h3>
            <p className="text-slate-500 text-sm leading-relaxed">LiteSpeed Cache plugin pre-installed. Website WordPress Anda akan loading dalam hitungan milidetik.</p>
          </div>

          {/* Feature 5: Support (Medium) */}
          <div className="md:col-span-12 lg:col-span-4 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-row lg:flex-col items-start gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Bantuan 24/7</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Tim teknis kami siap membantu Anda kapanpun via Live Chat & WhatsApp. Respon &lt; 5 menit.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
