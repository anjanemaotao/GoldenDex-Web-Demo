
import React, { useEffect, useState, useRef } from 'react';
import { MarketData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Info } from 'lucide-react';

interface MarketStatsProps {
  data: MarketData;
  lang: Language;
}

const XAULogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <circle cx="16" cy="16" r="15" fill="#EAB308" stroke="#CA8A04" strokeWidth="2"/>
    <circle cx="16" cy="16" r="11" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2 2"/>
    <path d="M10 16H22" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 10V22" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
    <text x="16" y="24" fontSize="6" fill="#713F12" fontWeight="bold" textAnchor="middle">GOLD</text>
  </svg>
);

const StatBox: React.FC<{ 
  label: string; 
  value: React.ReactNode; 
  color?: string; 
  explanation?: string;
  onClick?: () => void;
  isFunding?: boolean;
}> = ({ label, value, color, explanation, onClick, isFunding }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col px-4 border-r border-gray-200 dark:border-dark-border last:border-0 relative h-full justify-center">
      <div 
        className="flex items-center space-x-1 cursor-help group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
      >
        <span className={`text-xs text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap border-b border-dashed border-gray-300 dark:border-slate-600 transition-colors group-hover:border-brand-500 ${isFunding ? 'cursor-pointer font-bold' : ''}`}>
          {label}
        </span>
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${color || 'text-slate-900 dark:text-slate-100'}`}>
        {value}
      </span>
      
      {showTooltip && explanation && (
        <div className="absolute top-11 left-4 z-[2000] w-64 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl text-xs text-gray-600 dark:text-gray-300 leading-relaxed animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
          <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-1">
            <Info size={12} className="text-brand-500" />
            <span>{label}</span>
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
};

export const MarketStats: React.FC<MarketStatsProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];
  const [timeLeft, setTimeLeft] = useState('');
  const [showFundingDetail, setShowFundingDetail] = useState(false);
  const fundingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = data.nextFundingTime - Date.now();
      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.nextFundingTime]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fundingRef.current && !fundingRef.current.contains(e.target as Node)) {
        setShowFundingDetail(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUp = data.change24h >= 0;
  const colorClass = isUp ? 'text-trade-up' : 'text-trade-down';
  const estAPR = (data.fundingRate * 24 * 365).toFixed(2);

  return (
    <div className="flex items-center w-full overflow-x-auto lg:overflow-visible py-2 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border hide-scrollbar h-14 shrink-0 z-40">
       {/* Ticker Logo Area */}
      <div className="flex items-center px-4 min-w-fit">
        <XAULogo />
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{data.symbol}</h2>
          <span className="text-xs text-brand-500 font-semibold bg-brand-500/10 px-1 rounded">Perp</span>
        </div>
      </div>

      <StatBox
        label={t.lastPrice}
        value={data.lastPrice.toFixed(2)}
        color={colorClass}
        explanation={t.explanations.lastPrice}
      />
      
      <StatBox
        label={t.markPrice}
        value={data.markPrice.toFixed(2)}
        explanation={t.explanations.markPrice}
      />

      <StatBox
        label={t.indexPrice}
        value={data.indexPrice.toFixed(2)}
        explanation={t.explanations.indexPrice}
      />

      <div className="relative h-full" ref={fundingRef}>
        <StatBox
          label={t.fundingRate}
          isFunding
          onClick={() => setShowFundingDetail(!showFundingDetail)}
          value={
            <div className="flex space-x-2">
              <span className="text-brand-500 font-mono">{data.fundingRate.toFixed(4)}%</span>
              <span className="text-gray-400 font-mono">/ {timeLeft}</span>
            </div>
          }
          explanation={t.explanations.fundingRate}
        />
        {showFundingDetail && (
          <div className="absolute top-12 left-4 z-[2100] w-64 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
             <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center space-x-2">
               <div className="w-1 h-3 bg-brand-500 rounded-full" />
               <span>{t.fundingRate}</span>
             </h4>
             <div className="space-y-2.5">
               <div className="flex justify-between items-center text-[11px]">
                 <span className="text-gray-500">{t.fundingDetail.interval}</span>
                 <span className="font-bold dark:text-slate-200">1h</span>
               </div>
               <div className="flex justify-between items-center text-[11px]">
                 <span className="text-gray-500">{t.fundingDetail.direction}</span>
                 <span className={`font-bold ${data.fundingRate >= 0 ? 'text-trade-up' : 'text-trade-down'}`}>
                   {data.fundingRate >= 0 ? t.fundingDetail.longPaysShort : t.fundingDetail.shortPaysLong}
                 </span>
               </div>
               <div className="flex justify-between items-center text-[11px]">
                 <span className="text-gray-500">{t.fundingRate}</span>
                 <span className="font-bold text-brand-500 font-mono">{data.fundingRate.toFixed(4)}%</span>
               </div>
               <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                 <div className="flex justify-between items-center text-[11px]">
                   <span className="text-gray-500">{t.fundingDetail.estAPR}</span>
                   <span className="font-bold dark:text-white font-mono">{estAPR}%</span>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      <StatBox
        label={t.change24h}
        value={
          <div className={`flex items-center space-x-1 ${colorClass}`}>
            <span>{data.change24h.toFixed(2)}</span>
            <span>/ {isUp ? '+' : ''}{data.change24hPercent.toFixed(2)}%</span>
          </div>
        }
        explanation={t.explanations.change24h}
      />

      <StatBox
        label={t.highLow24h}
        value={
          <div className="flex space-x-1">
            <span className="text-trade-up">{data.high24h.toFixed(2)}</span>
            <span className="text-gray-400">/</span>
            <span className="text-trade-down">{data.low24h.toFixed(2)}</span>
          </div>
        }
        explanation={t.explanations.highLow24h}
      />

      <StatBox
        label={t.volume24h}
        value={`${data.volume24h.toFixed(2)} / ${parseInt(data.turnover24h.toString()).toLocaleString()}`}
        explanation={t.explanations.volume24h}
      />

      <StatBox
        label={t.openInterest}
        value={parseInt(data.openInterest.toString()).toLocaleString()}
        explanation={t.explanations.openInterest}
      />
    </div>
  );
};
