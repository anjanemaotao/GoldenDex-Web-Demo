
import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../constants';
import { Moon, Sun, Globe, Wallet, Settings, ChevronDown, Plus } from 'lucide-react';
import { AccountPopover, SettingsModal, EmailModal } from './Modals';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  isConnected: boolean;
  onConnectClick: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onDisconnect: () => void;
}

const FallbackLogo = () => (
  <div className="flex items-center space-x-2">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="2"/>
      <path d="M16 7V16L24 11.5" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 16L8 11.5" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 16V25" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white">
      Golden<span className="text-brand-500">Dex</span>
    </span>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ 
  lang, setLang, theme, setTheme, isConnected, onConnectClick, onDeposit, onWithdraw, onDisconnect 
}) => {
  const t = TRANSLATIONS[lang];
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isEmailBound, setIsEmailBound] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-10">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.reload()}>
          {!logoError ? (
            <img 
              src="https://r.jina.ai/i/6f9038ba986e4e8992c478a572c64993" 
              alt="GoldenDex" 
              className="h-8 w-auto min-w-[120px] object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <FallbackLogo />
          )}
        </div>
        
        <nav className="flex items-center h-14 space-x-6">
          <button className="px-1 h-full flex items-center text-sm font-bold text-brand-500 border-b-2 border-brand-500 transition-colors whitespace-nowrap">
            {t.perp}
          </button>
          <button className="px-1 h-full flex items-center text-sm font-bold text-gray-500 hover:text-brand-500 border-b-2 border-transparent hover:border-brand-500/50 transition-colors whitespace-nowrap cursor-default">
            {t.predictionMarket}
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {isConnected && (
           <button 
             onClick={onDeposit}
             className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#DCA85E] text-slate-900 font-bold text-sm shadow hover:bg-[#c99750] transition-colors"
           >
             <Plus size={16} />
             <span>{t.deposit}</span>
           </button>
        )}

        {isConnected ? (
          <div className="relative" ref={popoverRef}>
            <button 
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-mono text-sm font-bold transition hover:border-brand-500"
            >
              <span>0x4b...5591</span>
              <ChevronDown size={14} className={`transition ${accountOpen ? 'rotate-180' : ''}`} />
            </button>
            {accountOpen && (
              <AccountPopover 
                lang={lang} 
                onClose={() => setAccountOpen(false)} 
                onDisconnect={() => { onDisconnect(); setAccountOpen(false); }} 
                onDeposit={onDeposit} 
                onWithdraw={onWithdraw} 
              />
            )}
          </div>
        ) : (
          <button onClick={onConnectClick} className="bg-brand-500 text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-brand-600 transition-all">{t.connectWallet}</button>
        )}

        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-slate-700 pl-4">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center space-x-1 border border-gray-200 dark:border-slate-700 h-[38px] px-2.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 transition hover:border-brand-500">
               <span className="uppercase text-gray-500 dark:text-gray-400">
                  {lang === 'en' ? '🇺🇸 English' : lang === 'zh-CN' ? '🇨🇳 简体中文' : '🇨🇳 繁體中文'}
               </span>
               <ChevronDown size={12} className="text-gray-500" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50">
                <button onClick={() => {setLang('en'); setLangOpen(false)}} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">🇺🇸 English</button>
                <button onClick={() => {setLang('zh-CN'); setLangOpen(false)}} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">🇨🇳 简体中文</button>
                <button onClick={() => {setLang('zh-TW'); setLangOpen(false)}} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">🇨🇳 繁體中文</button>
              </div>
            )}
          </div>
          <button onClick={toggleTheme} className="text-gray-500 border border-gray-200 dark:border-slate-700 p-2 h-[38px] w-[38px] flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 hover:border-brand-500 transition">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => setSettingsOpen(true)} className="text-gray-500 border border-gray-200 dark:border-slate-700 p-2 h-[38px] w-[38px] flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 hover:border-brand-500 transition"><Settings size={18} /></button>
        </div>
      </div>
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        lang={lang} 
        isEmailBound={isEmailBound} 
        onBindClick={() => setEmailOpen(true)} 
      />
      <EmailModal 
        isOpen={emailOpen} 
        onClose={() => setEmailOpen(false)} 
        lang={lang} 
        onBind={() => { setIsEmailBound(true); setEmailOpen(false); }} 
      />
    </header>
  );
};
