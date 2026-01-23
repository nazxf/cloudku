
import React, { useState } from 'react';
import { FAQS } from '../constants';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-50" id="faq">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Pertanyaan Umum</h2>
            <p className="text-slate-600 text-lg">Masih bingung? Temukan jawabannya di sini atau hubungi kami via Live Chat.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === idx
                  ? 'border-blue-200 shadow-xl shadow-blue-500/10 ring-1 ring-blue-100'
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100'
                  }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full py-6 px-8 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                >
                  <span className={`text-lg font-bold transition-colors duration-300 ${openIndex === idx ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${openIndex === idx ? 'bg-blue-600 rotate-180 shadow-lg shadow-blue-500/30' : 'bg-slate-50 group-hover:bg-blue-50'
                    }`}>
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${openIndex === idx ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="px-8 pb-8 text-slate-600 leading-relaxed border-t border-slate-50 pt-6">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
