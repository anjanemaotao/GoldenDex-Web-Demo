
import React, { useState } from 'react';
import { Language, MarginMode, OrderType, OrderSide, Theme } from '../types';
import { TRANSLATIONS } from '../constants';
import { Edit3, X, Repeat } from 'lucide-react';

interface TradeFormProps {
  lang: Language;
  theme: Theme;
  isConnected: boolean;
  onConnect: () => void;
  onOrder: (side: OrderSide, type: OrderType, size: number, price: number, leverage: number, marginMode: MarginMode) => void;
  lastPrice: number;
  availableBalance: number;
}

export const CustomSlider: React.FC<{ value: number; onChange: (v: number) => void; theme: Theme }> = ({ value, onChange, theme }) => {
  return (
    <div className="relative w-full h-12 flex items-center group">
       <div className="absolute w-full h-1 bg-gray-300 dark:bg-slate-700 rounded-lg overflow-hidden">
          <div className="h-full bg-[#DCA85E]" style={{ width: `${value}%` }} />
       </div>
       <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-12 opacity-0 cursor-pointer z-30 relative"
        />
        <div 
          className="absolute w-8 h-8 bg-[#DCA85E] border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(0,0,0,0.2)] pointer-events-none transition-all duration-75 transform -translate-x-1/2 z-40"
          style={{ left: `${value}%` }}
        >
          <div className="absolute -top-7 px-2 py-0.5 bg-[#DCA85E] text-slate-900 text-[10px] font-black rounded border border-white/30 shadow-sm pointer-events-none">
             {Math.round(value)}%
          </div>
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full shadow-inner" />
        </div>
    </div>
  );
};

export const TradeForm: React.FC<TradeFormProps> = ({ lang, theme, isConnected, onConnect, onOrder, lastPrice, availableBalance }) => {
  const t = TRANSLATIONS[lang];
  const [type, setType] = useState<OrderType>(OrderType.MARKET);
  const [marginMode, setMarginMode] = useState<MarginMode>(MarginMode.CROSS);
  const [leverage, setLeverage] = useState<number>(20);
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [unit, setUnit] = useState<'XAU' | 'USDC'>('XAU');
  const [sliderValue, setSliderValue] = useState(0);
  const [showLeveragePopup, setShowLeveragePopup] = useState(false);

  const effectivePrice = type === OrderType.LIMIT && price ? parseFloat(price) : lastPrice;
  
  // Calculate display values
  const inputNum = parseFloat(amount) || 0;
  const xauAmount = unit === 'XAU' ? inputNum : inputNum / effectivePrice;
  const usdcValue = unit === 'USDC' ? inputNum : inputNum * effectivePrice;
  
  const marginReq = usdcValue / leverage;
  const maxOpenUSDC = availableBalance * leverage;
  const estFee = usdcValue * 0.0005;

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    const targetUSDC = maxOpenUSDC * (val / 100);
    if (unit === 'USDC') {
      setAmount(targetUSDC.toFixed(2));
    } else {
      setAmount((targetUSDC / effectivePrice).toFixed(4));
    }
  };

  const handleOrderClick = (side: OrderSide) => {
    if (!isConnected) { onConnect(); return; }
    if (xauAmount <= 0) return;
    onOrder(side, type, xauAmount, effectivePrice, leverage, marginMode);
    setAmount('');
    setSliderValue(0);
  };

  const InfoRow = ({ label, value, color }: { label: string, value: string, color?: string }) => (
    <div className="flex justify-between text-xs py-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`font-mono font-medium ${color || 'text-slate-900 dark:text-slate-200'}`}>{value}</span>
    </div>
  );

  const calcLiqPrice = (side: OrderSide) => {
    if (effectivePrice <= 0) return "0.00";
    // Simplified liq formula for demo
    const factor = side === OrderSide.BUY ? (1 - 0.9 / leverage) : (1 + 0.9 / leverage);
    return (effectivePrice * factor).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 p-0.5">
          <button onClick={() => setMarginMode(MarginMode.CROSS)} className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${marginMode === MarginMode.CROSS ? 'bg-slate-500/30 text-brand-500' : 'text-gray-500'}`}>{t.cross}</button>
          <button onClick={() => setMarginMode(MarginMode.ISOLATED)} className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${marginMode === MarginMode.ISOLATED ? 'bg-slate-500/30 text-brand-500' : 'text-gray-500'}`}>{t.isolated}</button>
        </div>
        <button onClick={() => setShowLeveragePopup(true)} className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700">
          <span>{leverage}x</span><Edit3 size={12} className="text-gray-500" />
        </button>
      </div>

      <div className="flex bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-0.5 mb-4">
        <button onClick={() => setType(OrderType.MARKET)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${type === OrderType.MARKET ? 'bg-slate-500 text-white shadow' : 'text-gray-500'}`}>{t.market}</button>
        <button onClick={() => setType(OrderType.LIMIT)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${type === OrderType.LIMIT ? 'bg-slate-500 text-white shadow' : 'text-gray-500'}`}>{t.limit}</button>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">{t.price}</div>
        <input type={type === OrderType.LIMIT ? "number" : "text"} value={type === OrderType.LIMIT ? price : ""} onChange={(e) => setPrice(e.target.value)} disabled={type === OrderType.MARKET} placeholder={type === OrderType.MARKET ? `${t.market} ${t.price}` : lastPrice.toFixed(2)} className="w-full bg-transparent border border-gray-200 dark:border-slate-700 rounded p-2.5 text-sm font-mono outline-none dark:text-white" />
      </div>

      <div className="mb-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">{t.amount}</span>
          <span className="text-gray-500">{t.avail}: <span className="font-mono">{availableBalance.toFixed(2)} USDC</span></span>
        </div>
        <div className="relative flex items-center">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border border-gray-300 dark:border-slate-600 rounded p-2.5 pr-20 text-sm font-bold font-mono outline-none dark:text-white" placeholder="0.00" />
          <button 
            onClick={() => setUnit(u => u === 'XAU' ? 'USDC' : 'XAU')}
            className="absolute right-0 h-full flex items-center pr-2 group"
          >
            <span className="bg-gray-200 dark:bg-slate-700 text-xs font-bold px-2 py-1 rounded flex items-center space-x-1 group-hover:bg-slate-600 transition-colors">
              <span>{unit}</span>
              <Repeat size={10} className="text-gray-500" />
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <CustomSlider value={sliderValue} onChange={handleSliderChange} theme={theme} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex flex-col">
          <button onClick={() => handleOrderClick(OrderSide.BUY)} className="py-4 bg-trade-up hover:bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 mb-3">{t.buyLong}</button>
          <div className="px-1 space-y-1">
             <InfoRow label={t.liqPrice} value={calcLiqPrice(OrderSide.BUY)} color="text-trade-up" />
             <InfoRow label={t.margin} value={marginReq.toFixed(2)} color="text-trade-up" />
             <InfoRow label={t.maxOpen} value={`${(maxOpenUSDC / effectivePrice).toFixed(2)} XAU`} color="text-trade-up" />
             <InfoRow label={t.estFee} value={`${estFee.toFixed(2)} USDC`} color="text-trade-up" />
          </div>
        </div>
        <div className="flex flex-col">
          <button onClick={() => handleOrderClick(OrderSide.SELL)} className="py-4 bg-trade-down hover:bg-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-900/20 mb-3">{t.sellShort}</button>
          <div className="px-1 space-y-1">
             <InfoRow label={t.liqPrice} value={calcLiqPrice(OrderSide.SELL)} color="text-trade-down" />
             <InfoRow label={t.margin} value={marginReq.toFixed(2)} color="text-trade-down" />
             <InfoRow label={t.maxOpen} value={`${(maxOpenUSDC / effectivePrice).toFixed(2)} XAU`} color="text-trade-down" />
             <InfoRow label={t.estFee} value={`${estFee.toFixed(2)} USDC`} color="text-trade-down" />
          </div>
        </div>
      </div>

      {showLeveragePopup && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-[1px]" onClick={() => setShowLeveragePopup(false)} />
          <div className="absolute top-16 left-4 right-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-[101] p-4 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-4"><span className="font-bold text-sm dark:text-white">{t.adjustLeverage}</span><button onClick={() => setShowLeveragePopup(false)} className="dark:text-white"><X size={16} /></button></div>
             <div className="bg-gray-100 dark:bg-slate-800 rounded p-2 mb-6 text-center"><span className="text-2xl font-bold text-brand-500">{leverage}x</span></div>
             <div className="relative px-1">
               <input type="range" min="1" max="20" step="1" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500 mb-6" />
               <div className="absolute -bottom-1 left-0 text-[10px] font-bold text-gray-400">1x</div>
               <div className="absolute -bottom-1 right-0 text-[10px] font-bold text-gray-400">20x</div>
             </div>
             <button onClick={() => setShowLeveragePopup(false)} className="w-full py-2 bg-brand-500 text-white font-bold rounded text-sm mt-4">{t.confirm}</button>
          </div>
        </>
      )}
    </div>
  );
};
