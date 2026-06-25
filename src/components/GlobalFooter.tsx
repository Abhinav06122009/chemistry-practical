import React, { useEffect } from 'react';
import {
  Shield, Mail, Phone, MapPin, Cloud, Lock
} from 'lucide-react';

const GlobalFooter = React.memo(() => {
  useEffect(() => {
    const scriptId = 'dmca-badge-helper';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://images.dmca.com/Badges/DMCABadgeHelper.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const socialLinks = [
    { 
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
        </svg>
      ), 
      label: 'Facebook', 
      href: 'https://www.facebook.com/vsavgyantapa/', 
      hoverColor: 'hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-950/20' 
    },
    { 
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ), 
      label: 'Instagram', 
      href: 'https://www.instagram.com/vsavgyantapa/', 
      hoverColor: 'hover:border-pink-500/50 hover:text-pink-400 hover:bg-pink-950/20' 
    },
  ];

  const footerLinks = {
    Resources: [
      { name: 'Blog', path: '#' },
      { name: 'Roadmap', path: '#' },
      { name: 'Calculator', path: '#' },
      { name: 'Study Timer', path: '#' },
      { name: 'Features', path: '#' },
      { name: 'About Us', path: '#' },
      { name: 'Success', path: '#' },
    ],
    Platform: [
      { name: 'AI Assistant', path: '#' },
      { name: 'Study Planner', path: '#' },
      { name: 'Doubt Solver', path: '#' },
      { name: 'AI Analytics', path: '#' },
      { name: 'Flashcards', path: '#' },
    ],
    Support: [
      { name: 'Help Center', path: '#' },
      { name: 'Contact Us', path: '#' },
      { name: 'Sitemap', path: '#' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
      { name: 'GDPR Compliance', path: '#' },
      { name: 'Security Report', path: '#' },
    ],
  };

  const trustBadges = [
    { href: 'https://www.ssllabs.com/ssltest/analyze.html?d=margdarshak.live', icon: Shield, label: 'SSL Labs A', sub: 'Verified', color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40' },
    { href: null, icon: Cloud, label: 'Cloudflare WAF', sub: 'Protected', color: 'text-orange-400', bg: 'bg-orange-950/60', border: 'border-orange-500/40' },
    { href: null, icon: Lock, label: 'HSTS Active', sub: 'Encrypted', color: 'text-slate-200', bg: 'bg-slate-800/60', border: 'border-slate-700/40' },
  ];

  return (
    <footer className="w-full relative bg-[#090d16] backdrop-blur-[40px] transition-colors duration-500 overflow-hidden text-slate-100 border-t border-slate-800/80">
      {/* Dynamic Aurora Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 mix-blend-screen">
        <div className="absolute -top-[50%] -left-[20%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_50%)] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -top-[30%] -right-[20%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_50%)] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Border Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)]" />

      <div className="max-w-7xl mx-auto relative px-6 pt-16 pb-10">
        
        {/* Main Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">
          
          {/* Brand Info Card */}
          <div className="col-span-2 space-y-4">
            <a href="https://margdarshak.live" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group w-fit">
              <div className="shrink-0 bg-white w-28 h-28 rounded-2xl flex items-center justify-center border border-slate-205 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(16,185,129,0.35)]">
                <img 
                  src="/logo.png" 
                  alt="Margdarshak Logo" 
                  style={{ height: '64px', width: 'auto', display: 'block', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' as any, transform: 'translateZ(0)', backfaceVisibility: 'hidden' as any }}
                  className="transition-transform duration-300" 
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-base font-black tracking-[-0.02em] text-white uppercase leading-none drop-shadow-sm group-hover:text-emerald-400 transition-colors duration-300">
                  MARGDARSHAK BETA VLABS VERSIONS
                </h2>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-[0.25em] block mt-1.5">AI Education Suite</span>
              </div>
            </a>

            <p className="text-[10px] text-slate-350 leading-relaxed max-w-[240px] uppercase tracking-wide">
              Engineering high-fidelity cognitive ecosystems for every student. Powered by VSAV GYANTAPA.
            </p>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-xl text-[10px] uppercase font-bold tracking-wide space-y-1 max-w-[280px]">
              <div className="flex items-center gap-1.5 text-amber-450">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>UNDER DEVELOPMENT</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal font-semibold normal-case">
                This is a Margdarshak VLabs future update and is currently under active development. For VSAV Gyantapa engineers and developers testing only.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center text-slate-300 transition-all duration-300 ${s.hoverColor} shadow-sm`}
                >
                  {s.svg}
                </a>
              ))}
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-[10px] text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="text-slate-500" />
                <a href="mailto:care@margdarshak.live" className="hover:text-emerald-400 transition-colors">care@margdarshak.live</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={13} className="text-slate-500" />
                <a href="tel:04424547835" className="hover:text-emerald-400 transition-colors">04424547835</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={13} className="text-slate-500" />
                <span>India 🇮🇳 · Serving Globally</span>
              </div>
            </div>
          </div>

          {/* Dynamic Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.path}
                      className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-emerald-400 hover:translate-x-1.5 transition-all duration-300 uppercase tracking-widest"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-emerald-450 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-6 border-y border-slate-800/80 mb-8">
          {trustBadges.map((badge, i) => {
            const Inner = (
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${badge.bg} border ${badge.border} transition-all hover:-translate-y-0.5 duration-300 shadow-md`}
              >
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <div>
                  <div className={`text-[8.5px] font-black uppercase tracking-widest ${badge.color}`}>{badge.label}</div>
                  <div className="text-[7.5px] text-slate-300 uppercase tracking-widest font-semibold">{badge.sub}</div>
                </div>
              </div>
            );
            return badge.href ? (
              <a key={i} href={badge.href} target="_blank" rel="noopener noreferrer">{Inner}</a>
            ) : <div key={i}>{Inner}</div>;
          })}
        </div>

        {/* Footer Bottom copyright branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 pt-6 border-t border-slate-800/80 text-[8.5px] font-mono text-slate-450">
          <div className="flex items-center gap-2.5">
            <span>© {new Date().getFullYear()} VSAV GYANTAPA · ALL RIGHTS RESERVED</span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span>DESIGNED BY <span className="text-emerald-400 font-bold">ABHINAV JHA</span></span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://www.virustotal.com/gui/domain/margdarshak.live" title="VirusTotal Analysis" className="hover:opacity-100 opacity-60 transition-opacity">
              <img src="/virustotal.svg" alt="VirusTotal" className="h-4.5" />
            </a>
            <a href="https://www.dmca.com/Protection/Status.aspx?ID=443f30f6-acf0-4a54-8947-a91bfdca1140&refurl=https://margdarshak.live/" title="DMCA.com Protection Status" className="hover:opacity-100 opacity-60 transition-opacity"> 
              <img src="https://images.dmca.com/Badges/DMCA_logo-200w_b.png?ID=443f30f6-acf0-4a54-8947-a91bfdca1140" alt="DMCA.com Protection Status" className="h-5.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
});

GlobalFooter.displayName = 'GlobalFooter';

export default GlobalFooter;
