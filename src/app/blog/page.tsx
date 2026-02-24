'use client';

import MainLayout from '@/components/layout/MainLayout';

const BLOG_POSTS = [
  { date: '20. Apr 2025', title: 'Kako AI mijenja online marketplace', desc: 'Napredno prepoznavanje namjere, automatska kategorizacija i pametna pretraga — sve što NudiNađi donosi.', category: 'AI', readTime: '5 min', color: 'purple' },
  { date: '12. Apr 2025', title: '5 savjeta za brzu prodaju na NudiNađi', desc: 'Kako napisati oglas koji prodaje: naslovi, slike, cijene i tajming — iz naših podataka.', category: 'Savjeti', readTime: '3 min', color: 'blue' },
  { date: '01. Apr 2025', title: 'Sigurnost na prvom mjestu: Kako prepoznati scam', desc: 'Naš AI detektuje 99% lažnih oglasa — ali i ti možeš prepoznati znakove upozorenja.', category: 'Sigurnost', readTime: '4 min', color: 'emerald' },
  { date: '25. Mar 2025', title: 'NudiNađi vs. tradicionalni oglasnici', desc: 'Zašto smo drugačiji: AI pretraga, vizualna prodaja, Trust Score i real-time zaštita.', category: 'Proizvod', readTime: '6 min', color: 'orange' },
  { date: '15. Mar 2025', title: 'Lansirali smo NudiNađi!', desc: 'Naša priča — od ideje do platforme. Kako smo izgradili AI marketplace iz BiH za regiju.', category: 'Vijesti', readTime: '7 min', color: 'blue' },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500' },
};

export default function BlogPage() {
  return (
    <MainLayout title="Blog">
      <div className="max-w-4xl mx-auto py-6">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-pen-fancy text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] font-bold text-orange-400 uppercase tracking-[0.2em]">Blog</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--c-text)] uppercase leading-none tracking-tighter mb-4">
            PRIČE, SAVJETI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">&amp; NOVOSTI.</span>
          </h1>
          <div className="w-10 h-[3px] bg-orange-500 mb-4"></div>
          <p className="text-[13px] text-[var(--c-text2)] leading-relaxed max-w-[560px]">
            Najnovije iz svijeta NudiNađi — tutorijali, savjeti za kupovinu i prodaju, AI novosti i priče iz zajednice.
          </p>
        </div>

        {/* BLOG POSTS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-orange-500"></div>
            <p className="text-[9px] font-black text-[var(--c-text3)] uppercase tracking-[0.25em]">Najnoviji članci</p>
          </div>

          {/* Featured post */}
          <div className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-6 mb-4 hover:border-purple-500/40 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-[50px]"></div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 ${colorMap.purple.bg} border ${colorMap.purple.border} rounded-[4px] text-[8px] font-bold ${colorMap.purple.text} uppercase`}>{BLOG_POSTS[0].category}</span>
              <span className="text-[9px] text-[var(--c-text3)]">{BLOG_POSTS[0].date}</span>
              <span className="text-[9px] text-[var(--c-text3)]">· {BLOG_POSTS[0].readTime} čitanja</span>
            </div>
            <h2 className="text-xl font-black text-[var(--c-text)] group-hover:text-purple-500 transition-colors mb-2">{BLOG_POSTS[0].title}</h2>
            <p className="text-[11px] text-[var(--c-text3)] leading-relaxed max-w-[500px]">{BLOG_POSTS[0].desc}</p>
          </div>

          {/* Other posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BLOG_POSTS.slice(1).map((post) => {
              const c = colorMap[post.color] || colorMap.blue;
              return (
                <div key={post.title} className="bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[4px] p-5 hover:border-blue-500/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 ${c.bg} border ${c.border} rounded-[4px] text-[8px] font-bold ${c.text} uppercase`}>{post.category}</span>
                    <span className="text-[9px] text-[var(--c-text3)]">{post.date}</span>
                  </div>
                  <h3 className="text-[13px] font-black text-[var(--c-text)] group-hover:text-blue-500 transition-colors mb-1">{post.title}</h3>
                  <p className="text-[10px] text-[var(--c-text3)] leading-relaxed">{post.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-[9px] text-[var(--c-text3)]">
                    <i className="fa-solid fa-clock text-[8px]"></i>
                    <span>{post.readTime} čitanja</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="text-center py-8 border-t border-[var(--c-border)]">
          <p className="text-lg font-black text-[var(--c-text)] uppercase tracking-tight mb-1">
            &ldquo;Znanje je moć. Dijeli ga.&rdquo;
          </p>
          <p className="text-[8px] font-bold text-[var(--c-text3)] uppercase tracking-[0.3em]">NudiNađi Blog — Redovno ažuriran</p>
        </div>
      </div>
    </MainLayout>
  );
}
