
import React, { useState, useEffect, useRef } from 'react';
import { AccountInfo as AccountInfoType, Language, Position, MarginMode } from '../types';
import { TRANSLATIONS } from '../constants';
import { Info, ChevronDown } from 'lucide-react';

interface AccountInfoProps {
  lang: Language;
  info: AccountInfoType;
  positions: Position[];
  currentMarginMode: MarginMode;
}

const InfoRow = ({ 
  label, 
  value, 
  explanation, 
  isPnL = false 
}: { 
  label: string; 
  value: string; 
  explanation?: string; 
  isPnL?: boolean;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  let colorClass = 'text-slate-900 dark:text-slate-200';
  if (isPnL) {
    if (value.startsWith('+')) colorClass = 'text-trade-up';
    else if (value.startsWith('-')) colorClass = 'text-trade-down';
  }

  return (
    <div className="flex justify-between items-center py-1.5 group relative">
      <div 
        className="flex items-center space-x-1 cursor-help border-b border-dashed border-gray-300 dark:border-slate-700 transition-colors hover:border-brand-500"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      </div>
      <span className={`text-xs font-mono font-bold ${colorClass}`}>{value}</span>
      
      {showTooltip && explanation && (
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-[5000] w-64 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl text-xs text-gray-600 dark:text-gray-300 leading-relaxed animate-in fade-in slide-in-from-right-2 duration-150 ring-1 ring-black/5 pointer-events-none">
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

export const AccountInfo: React.FC<AccountInfoProps> = ({ lang, info, positions, currentMarginMode }) => {
  const t = TRANSLATIONS[lang];
  const [selectedPosId, setSelectedPosId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCross = currentMarginMode === MarginMode.CROSS;
  const isolatedPositions = positions.filter(p => p.marginMode === MarginMode.ISOLATED);

  // 当进入逐仓模式或持仓变化时，如果当前未选中或选中的不在列表中，默认选择最新的一个逐仓仓位
  useEffect(() => {
    if (!isCross && isolatedPositions.length > 0) {
      if (!selectedPosId || !isolatedPositions.some(p => p.id === selectedPosId)) {
        // 默认选中第一个（模拟最新）
        setSelectedPosId(isolatedPositions[0].id);
      }
    } else {
      setSelectedPosId(null);
    }
  }, [currentMarginMode, positions.length, isCross, selectedPosId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPos = isolatedPositions.find(p => p.id === selectedPosId);

  // 计算显示的标题
  const displayTitle = isCross 
    ? t.usdcMargin 
    : (currentPos 
        ? `${currentPos.symbol} ${currentPos.side === 'BUY' ? t.long : t.short}-${t.isolated}`
        : `${t.isolated} ${lang === 'en' ? 'No Position' : '无持仓'}`);

  // 根据选中的仓位模拟数据
  const displayInfo = isCross ? {
    ratio: info.marginRatio,
    maint: info.maintenanceMargin,
    balance: info.marginBalance
  } : (currentPos ? {
    ratio: (Math.random() * 5 + 10).toFixed(1),
    maint: (currentPos.margin * 0.05).toFixed(2),
    balance: (currentPos.margin + currentPos.pnl).toFixed(2)
  } : {
    ratio: '0.0',
    maint: '0.00',
    balance: '0.00'
  });

  // 动态选择保证金余额的解释文案
  const marginBalanceExplanation = isCross 
    ? t.explanations.marginBalanceCross 
    : t.explanations.marginBalanceIsolated;

  return (
    <div className="flex flex-col bg-white dark:bg-dark-card border-l border-t border-gray-200 dark:border-dark-border p-4 flex-1 select-none">
      <div className="mb-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 border-l-4 border-brand-500 pl-3 uppercase tracking-wider">
          {t.contractAccount}
        </h4>
        <div className="space-y-0.5">
          <InfoRow 
            label={t.totalValue} 
            value={`${info.totalValue.toLocaleString()} USDC`} 
            explanation={t.explanations.totalValue}
          />
          <InfoRow 
            label={t.unrealized} 
            value={`${info.unrealizedPnl >= 0 ? '+' : ''}${info.unrealizedPnl.toLocaleString()} USDC`} 
            isPnL 
            explanation={t.explanations.unrealized}
          />
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3 border-l-4 border-brand-500 pl-3 min-h-[24px]">
           <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
             {displayTitle}
           </h4>
           
           {!isCross && isolatedPositions.length > 0 && (
             <div className="relative shrink-0 ml-2" ref={dropdownRef}>
               <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-400 hover:text-brand-500 transition-colors p-1"
               >
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </button>

               {isDropdownOpen && (
                 <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded shadow-2xl z-[6000] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-black/10">
                    <div className="py-1">
                      {isolatedPositions.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => { setSelectedPosId(p.id); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedPosId === p.id ? 'text-brand-500' : 'text-slate-400'}`}
                        >
                          {p.symbol} {p.side === 'BUY' ? t.long : t.short}-{t.isolated}
                        </button>
                      ))}
                    </div>
                 </div>
               )}
             </div>
           )}
        </div>

        <div className="space-y-0.5">
          <InfoRow 
            label={t.marginRatio} 
            value={`${displayInfo.ratio}%`} 
            explanation={t.explanations.marginRatio}
          />
          <InfoRow 
            label={t.maintMargin} 
            value={`${Number(displayInfo.maint).toLocaleString()} USDC`} 
            explanation={t.explanations.maintMargin}
          />
          <InfoRow 
            label={t.marginBalance} 
            value={`${Number(displayInfo.balance).toLocaleString()} USDC`} 
            explanation={marginBalanceExplanation}
          />
        </div>
      </div>
    </div>
  );
};
