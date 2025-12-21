
import React, { useState } from 'react';
import { AccountInfo as AccountInfoType, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Info } from 'lucide-react';

interface AccountInfoProps {
  lang: Language;
  info: AccountInfoType;
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

export const AccountInfo: React.FC<AccountInfoProps> = ({ lang, info }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col bg-white dark:bg-dark-card border-l border-t border-gray-200 dark:border-dark-border p-4 flex-1">
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

      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 border-l-4 border-brand-500 pl-3 uppercase tracking-wider">
          {t.usdcMargin}
        </h4>
        <div className="space-y-0.5">
          <InfoRow 
            label={t.marginRatio} 
            value={`${info.marginRatio}%`} 
            explanation={t.explanations.marginRatio}
          />
          <InfoRow 
            label={t.maintMargin} 
            value={`${info.maintenanceMargin.toLocaleString()} USDC`} 
            explanation={t.explanations.maintMargin}
          />
          <InfoRow 
            label={t.marginBalance} 
            value={`${info.marginBalance.toLocaleString()} USDC`} 
            explanation={t.explanations.marginBalance}
          />
        </div>
      </div>
    </div>
  );
};
