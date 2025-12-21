
import React, { useEffect, useState, useRef } from 'react';
import { MarketData, Language } from '../types';
import { TRANSLATIONS, MOCK_MARKETS } from '../constants';
import { Info, ChevronDown, Search } from 'lucide-react';

interface MarketStatsProps {
  data: MarketData;
  lang: Language;
  onMarketSelect: (market: MarketData) => void;
}

const XAULogo = ({ symbol }: { symbol: string }) => {
  const isGold = symbol.startsWith('XAU');
  const isSilver = symbol.startsWith('XAG');
  const isBtc = symbol.startsWith('BTC');
  const isEth = symbol.startsWith('ETH');

  const getColors = () => {
    if (isGold) return { main: '#EAB308', stroke: '#CA8A04', text: 'GOLD' };
    if (isSilver) return { main: '#94A3B8', stroke: '#64748B', text: 'SLVR' };
    if (isBtc) return { main: '#F7931A', stroke: '#E17E06', text: 'BTC' };
    if (isEth) return { main: '#627EEA', stroke: '#4559B4', text: 'ETH' };
    return { main: '#6366F1', stroke: '#4F46E5', text: 'PERP' };
  };
  
  const colors = getColors();

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill={colors.main} stroke={colors.stroke} strokeWidth="2"/>
      <circle cx="16" cy="16" r="11" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 2"/>
      <path d="M10 16H22" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 10V22" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
      <text x="16" y="24" fontSize="6" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">{colors.text}</text>
    </svg>
  );
};

const MarketSelector = ({ 
  lang, 
  onSelect, 
  onClose 
}: { 
  lang: Language; 
  onSelect: (market: MarketData) => void;
  onClose: () => void;
}) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  
  const filteredMarkets = MOCK_MARKETS.filter(m => 
    m.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute top-14 left-4 w-[520px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.search} 
          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-500 transition-colors dark:text-white"
          autoFocus
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-slate-800">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
            <tr>
              <th className="py-2 px-4">{t.marketName}</th>
              <th className="py-2 px-2 text-right">{t.lastPrice}</th>
              <th className="py-2 px-2 text-right">24h涨跌幅</th>
              <th className="py-2 px-2 text-right">24h成交额</th>
              <th className="py-2 px-4 text-right">资金费率</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarkets.map(m => {
              const isUp = m.change24h >= 0;
              return (
                <tr 
                  key={m.symbol}
                  onClick={() => { onSelect(m); onClose(); }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <XAULogo symbol={m.symbol} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{m.symbol}</span>
                        <span className="text-[9px] bg-gray-100 dark:bg-slate-800 text-gray-500 px-1 rounded inline-block w-fit">20x</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold dark:text-white">
                    {m.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono font-bold ${isUp ? 'text-trade-up' : 'text-trade-down'}`}>
                    {isUp ? '+' : ''}{m.change24hPercent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-gray-600 dark:text-gray-400">
                    {(m.turnover24h / 1000000).toFixed(2)}M
                  </td>
                  <td className={`py-3 px-4 text-right font-mono ${m.fundingRate >= 0 ? 'text-trade-up' : 'text-trade-down'}`}>
                    {m.fundingRate >= 0 ? '+' : ''}{m.fundingRate.toFixed(4)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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

export const MarketStats: React.FC<MarketStatsProps> = ({ data, lang, onMarketSelect }) => {
  const t = TRANSLATIONS[lang];
  const [timeLeft, setTimeLeft] = useState('');
  const [showFundingDetail, setShowFundingDetail] = useState(false);
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  
  const fundingRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

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
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setShowMarketSelector(false);
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
       {/* 合约选择器触发区域 */}
      <div className="relative h-full flex items-center" ref={selectorRef}>
        <div 
          className="flex items-center px-4 min-w-fit cursor-pointer group select-none h-full"
          onClick={() => setShowMarketSelector(!showMarketSelector)}
        >
          <XAULogo symbol={data.symbol} />
          <div className="mx-3">
            <div className="flex items-center space-x-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-500 transition-colors">{data.symbol}</h2>
              <ChevronDown size={18} className={`text-gray-400 group-hover:text-brand-500 transition-all ${showMarketSelector ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[10px] text-brand-500 font-semibold bg-brand-500/10 px-1 rounded">Perp</span>
          </div>
        </div>
        
        {showMarketSelector && (
          <MarketSelector 
            lang={lang} 
            onSelect={onMarketSelect} 
            onClose={() => setShowMarketSelector(false)} 
          />
        )}
      </div>

      <StatBox
        label={t.lastPrice}
        value={data.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        color={colorClass}
        explanation={t.explanations.lastPrice}
      />
      
      <StatBox
        label={t.markPrice}
        value={data.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        explanation={t.explanations.markPrice}
      />

      <StatBox
        label={t.indexPrice}
        value={data.indexPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
