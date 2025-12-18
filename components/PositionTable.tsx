
import React, { useState, useEffect } from 'react';
import { Position, Order, Language, MarginMode, OrderType, Theme, OrderSide } from '../types';
import { TRANSLATIONS, INITIAL_MARKET_DATA, MOCK_FUNDING_RECORDS, MOCK_HISTORY_ORDERS, MOCK_TRADE_HISTORY } from '../constants';
import { Edit3, Trash2, X, ChevronDown, Repeat, Filter, PlusCircle, MinusCircle, Info } from 'lucide-react';
import { CustomSlider } from './TradeForm';

interface PositionTableProps {
  positions: Position[];
  orders: Order[];
  assetHistory: any[];
  lang: Language;
  theme: Theme;
  onClosePosition: (id: string, type: OrderType, price?: number, amount?: number) => void;
  onCancelOrder: (id: string) => void;
  onEditMargin: (position: Position, type: 'add' | 'extract') => void;
  onCloseAll: () => void;
  onCancelAll: () => void;
}

const ThWithTooltip: React.FC<{ label: string; explanation?: string; align?: 'left' | 'right' }> = ({ label, explanation, align = 'left' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <th className={`py-1.5 px-4 font-semibold text-gray-500 uppercase relative ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div 
        className={`inline-flex items-center space-x-1 cursor-help border-b border-dashed border-gray-300 dark:border-slate-700 transition-colors hover:border-brand-500 ${align === 'right' ? 'justify-end' : ''}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{label}</span>
      </div>
      {showTooltip && explanation && (
        <div className={`absolute top-8 ${align === 'right' ? 'right-4' : 'left-4'} z-[2000] w-64 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl text-xs text-gray-600 dark:text-gray-300 leading-relaxed normal-case animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5`}>
          <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-1">
            <Info size={12} className="text-brand-500" />
            <span>{label}</span>
          </div>
          {explanation}
        </div>
      )}
    </th>
  );
};

export const PositionTable: React.FC<PositionTableProps> = ({ positions, orders, assetHistory, lang, theme, onClosePosition, onCancelOrder, onEditMargin, onCloseAll, onCancelAll }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'positions' | 'openOrders' | 'orderHistory' | 'tradeHistory' | 'assetsHistory' | 'fundingHistory'>('positions');
  const [closingPos, setClosingPos] = useState<Position | null>(null);
  const [fundingFilter, setFundingFilter] = useState('all');
  const [showCloseAllModal, setShowCloseAllModal] = useState(false);

  // Dynamic Recent Trades
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with mock
    setRecentTrades(MOCK_TRADE_HISTORY);
    
    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const newTrade = {
        id: Date.now().toString(),
        symbol: 'XAUUSDC',
        side,
        price: 2840 + Math.random() * 10,
        amount: Math.random() * 5,
        total: (2840 + Math.random() * 10) * (Math.random() * 5),
        fee: Math.random() * 2,
        pnl: (Math.random() - 0.5) * 50,
        time: new Date().toISOString().slice(11, 19)
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getTabLabel = (tabId: string) => {
    // Cast to any to avoid TS error with nested translation objects when indexing with dynamic keys
    const label = (t as any)[tabId] || tabId;
    if (tabId === 'positions') return `${label}(${positions.length})`;
    if (tabId === 'openOrders') return `${label}(${orders.length})`;
    return label;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-teal-500 bg-teal-500/10';
      case 'processing': case 'confirming': case 'reviewing': return 'text-amber-500 bg-amber-500/10';
      case 'rejected': case 'failed': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const CloseModal = ({ pos, onClose }: { pos: Position, onClose: () => void }) => {
    const [closeType, setCloseType] = useState<OrderType>(OrderType.MARKET);
    const [closePrice, setClosePrice] = useState<string>(INITIAL_MARKET_DATA.lastPrice.toFixed(2));
    const [closeAmount, setCloseAmount] = useState<string>(pos.size.toString());
    const [unit, setUnit] = useState<'XAU' | 'USDC'>('XAU');
    const [sliderVal, setSliderVal] = useState(100);

    const handleConfirm = () => { 
      const amountNum = parseFloat(closeAmount) || 0;
      const xauAmount = unit === 'XAU' ? amountNum : amountNum / (parseFloat(closePrice) || pos.markPrice);
      onClosePosition(pos.id, closeType, parseFloat(closePrice), xauAmount); 
      onClose(); 
    };

    const handleSlider = (val: number) => { 
      setSliderVal(val);
      const targetXAU = pos.size * (val / 100);
      if (unit === 'XAU') {
        setCloseAmount(targetXAU.toFixed(4));
      } else {
        setCloseAmount((targetXAU * (parseFloat(closePrice) || pos.markPrice)).toFixed(2));
      }
    };

    const amountNum = parseFloat(closeAmount) || 0;
    const estXAU = unit === 'XAU' ? amountNum : amountNum / (parseFloat(closePrice) || pos.markPrice);
    const estPnl = estXAU * ((closeType === OrderType.MARKET ? pos.markPrice : parseFloat(closePrice) || pos.markPrice) - pos.entryPrice);

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#1a1c22] border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold dark:text-white">{t.closePos}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.tradingPair}</span>
                <span className="font-bold text-teal-600 font-mono">{pos.symbol} / {pos.side === 'BUY' ? t.long : t.short}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{t.entryPrice}: <span className="font-mono">{pos.entryPrice.toFixed(2)}</span></span>
                <span>{t.markPrice}: <span className="font-mono">{pos.markPrice.toFixed(2)}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">{t.closePrice}</label>
                <input type="number" disabled={closeType === OrderType.MARKET} value={closeType === OrderType.MARKET ? "" : closePrice} onChange={e => setClosePrice(e.target.value)} placeholder={closeType === OrderType.MARKET ? t.market : ""} className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 text-sm font-mono outline-none dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Mode</label>
                <div onClick={() => setCloseType(prev => prev === OrderType.MARKET ? OrderType.LIMIT : OrderType.MARKET)} className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 text-sm cursor-pointer dark:text-white">
                  <span className="font-mono">{closeType === OrderType.MARKET ? t.market : t.limit}</span>
                  <Repeat size={14} className="text-gray-500" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">{t.closeAmount}</label>
              <div className="relative">
                <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 pr-16 text-sm font-mono outline-none dark:text-white" />
                <button 
                  onClick={() => setUnit(u => u === 'XAU' ? 'USDC' : 'XAU')}
                  className="absolute right-2 top-1.5 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold text-gray-500 flex items-center space-x-1"
                >
                  <span>{unit}</span><Repeat size={8} />
                </button>
              </div>
            </div>

            <div className="pt-2"><CustomSlider value={sliderVal} onChange={handleSlider} theme={theme} /></div>

            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex justify-between text-xs text-gray-500"><span>{t.heldAmount}</span><span className="font-mono dark:text-white">{pos.size} XAU</span></div>
              <div className="flex justify-between text-xs text-gray-500 font-bold"><span>{t.estPnl}</span><span className={`font-mono ${estPnl >= 0 ? 'text-teal-600' : 'text-trade-down'}`}>{estPnl.toFixed(2)} USDC</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={onClose} className="py-2.5 border border-[#dca85e] text-[#dca85e] rounded font-bold hover:bg-[#dca85e]/5 transition">{t.cancel}</button>
              <button onClick={handleConfirm} className="py-2.5 bg-[#dca85e] text-slate-900 rounded font-bold shadow-lg shadow-[#dca85e]/20 hover:bg-[#c99750] transition">{t.confirm}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredFunding = MOCK_FUNDING_RECORDS.filter(r => fundingFilter === 'all' || r.type === fundingFilter);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border overflow-hidden">
      <div className="flex items-center px-4 border-b border-gray-200 dark:border-dark-border shrink-0 overflow-x-auto hide-scrollbar z-20">
        {['positions', 'openOrders', 'orderHistory', 'tradeHistory', 'assetsHistory', 'fundingHistory'].map(tabId => (
          <button 
            key={tabId} 
            onClick={() => setActiveTab(tabId as any)} 
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tabId ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {getTabLabel(tabId)}
          </button>
        ))}
        {activeTab === 'positions' && positions.length > 0 && (
          <button 
            onClick={() => setShowCloseAllModal(true)}
            className="ml-auto bg-trade-down/10 text-trade-down border border-trade-down/30 px-3 py-1 rounded text-xs font-bold hover:bg-trade-down hover:text-white transition"
          >
            {t.closeAll}
          </button>
        )}
        {activeTab === 'openOrders' && orders.length > 0 && (
          <button 
            onClick={() => onCancelAll()}
            className="ml-auto bg-slate-100 dark:bg-slate-800 text-gray-500 px-3 py-1 rounded text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {t.cancelAll}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'positions' ? (
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-white dark:bg-dark-card z-10 shadow-sm">
              <tr className="text-gray-500 uppercase border-b border-gray-200 dark:border-slate-800">
                <th className="py-1.5 px-4 font-semibold">{t.symbol}</th>
                <ThWithTooltip label={t.nominalValue} explanation={t.explanations.nominalValue} />
                <ThWithTooltip label={t.entryPrice} explanation={t.explanations.entryPrice} />
                <ThWithTooltip label={t.markPrice} explanation={t.explanations.markPrice} />
                <ThWithTooltip label={t.liqPrice} explanation={t.explanations.liqPrice} />
                <ThWithTooltip label={t.margin} explanation={t.explanations.margin} />
                <ThWithTooltip label={t.unrealizedPnl} explanation={t.explanations.unrealizedPnl} align="right" />
                <th className="py-1.5 px-4 font-semibold text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos.id} className="border-b border-gray-100 dark:border-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/20">
                  <td className="py-1.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{pos.symbol}</span>
                      <div className="flex items-center space-x-2"><span className={`font-bold ${pos.side === 'BUY' ? 'text-trade-up' : 'text-trade-down'}`}>{pos.side === 'BUY' ? t.long : t.short}</span><span className="text-[10px] text-gray-500 font-bold bg-gray-100 dark:bg-slate-800 px-1 rounded">{pos.leverage}x</span></div>
                    </div>
                  </td>
                  <td className="py-1.5 px-4">
                    <div className="flex flex-col font-mono">
                      <span className="dark:text-white">{pos.size.toFixed(4)} XAU</span>
                      <span className="text-[10px] text-gray-500">{(pos.size * pos.markPrice).toFixed(2)} USDC</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-4 font-mono dark:text-white">{pos.entryPrice.toFixed(2)}</td>
                  <td className="py-1.5 px-4 font-mono text-slate-400">{pos.markPrice.toFixed(2)}</td>
                  <td className="py-1.5 px-4 text-orange-500 font-mono font-bold">{pos.liquidationPrice.toFixed(2)}</td>
                  <td className="py-1.5 px-4 font-mono dark:text-white">
                    <div className="flex flex-col leading-none">
                      <div className="flex items-center space-x-2">
                        <span>{pos.margin.toFixed(2)}</span>
                        {pos.marginMode === MarginMode.ISOLATED && (
                          <div className="flex items-center space-x-1">
                            <button onClick={() => onEditMargin(pos, 'add')} className="text-teal-500 hover:text-teal-400"><PlusCircle size={14} /></button>
                            <button onClick={() => onEditMargin(pos, 'extract')} className="text-rose-500 hover:text-rose-400"><MinusCircle size={14} /></button>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500 uppercase mt-0.5">{pos.marginMode === MarginMode.CROSS ? t.cross : t.isolated}</span>
                    </div>
                  </td>
                  <td className={`py-1.5 px-4 text-right font-mono ${pos.pnl >= 0 ? 'text-trade-up' : 'text-trade-down'}`}><div>{pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}</div><div className="text-[10px] opacity-70">{pos.pnlPercent.toFixed(2)}%</div></td>
                  <td className="py-1.5 px-4 text-right"><button onClick={() => setClosingPos(pos)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-brand-500 dark:text-white rounded-md font-bold transition-all shadow-sm">{t.marketLimitClose}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'openOrders' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card z-10 border-b border-gray-200 dark:border-slate-800">
               <tr className="text-gray-500 uppercase">
                 <th className="py-2 px-4">{t.symbol}</th>
                 <th className="py-2 px-4">{t.type}</th>
                 <th className="py-2 px-4">{t.price}</th>
                 <th className="py-2 px-4">{t.filled}</th>
                 <th className="py-2 px-4">{t.totalOrder}</th>
                 <th className="py-2 px-4">{t.fillRate}</th>
                 <th className="py-2 px-4">{t.time}</th>
                 <th className="py-2 px-4 text-right">{t.action}</th>
               </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-slate-800/30">
                  <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{o.symbol} / <span className={o.side === 'BUY' ? 'text-trade-up' : 'text-trade-down'}>{o.side === 'BUY' ? t.long : t.short}</span></td>
                  <td className="py-2 px-4 text-gray-500">{t.limit}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.price.toFixed(2)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.filled.toFixed(4)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.amount.toFixed(4)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{((o.filled / o.amount) * 100).toFixed(2)}%</td>
                  <td className="py-2 px-4 text-gray-500">{o.time}</td>
                  <td className="py-2 px-4 text-right"><button onClick={() => onCancelOrder(o.id)} className="text-trade-down hover:underline font-bold">{t.cancelOrder}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'orderHistory' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card z-10 border-b border-gray-200 dark:border-slate-800">
               <tr className="text-gray-500 uppercase">
                 <th className="py-2 px-4">{t.symbol}</th>
                 <th className="py-2 px-4">{t.type}</th>
                 <th className="py-2 px-4">{t.price}</th>
                 <th className="py-2 px-4">{t.filled}</th>
                 <th className="py-2 px-4">{t.totalOrder}</th>
                 <th className="py-2 px-4">{t.status}</th>
                 <th className="py-2 px-4">{t.time}</th>
               </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY_ORDERS.map(o => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-slate-800/30">
                  <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{o.symbol} / <span className={o.side === 'BUY' ? 'text-trade-up' : 'text-trade-down'}>{o.side === 'BUY' ? t.long : t.short}</span></td>
                  <td className="py-2 px-4 text-gray-500">{o.type === 'LIMIT' ? t.limit : t.market}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.price.toFixed(2)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.filled.toFixed(4)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{o.total.toFixed(4)}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded ${getStatusColor(o.status)}`}>{(t as any)[o.status] || o.status}</span></td>
                  <td className="py-2 px-4 text-gray-500">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'tradeHistory' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card z-10 border-b border-gray-200 dark:border-slate-800">
               <tr className="text-gray-500 uppercase">
                 <th className="py-2 px-4">{t.symbol}</th>
                 <th className="py-2 px-4">{t.price}</th>
                 <th className="py-2 px-4">{t.amount}</th>
                 <th className="py-2 px-4">{t.total}</th>
                 <th className="py-2 px-4">{t.fee}</th>
                 <th className="py-2 px-4">{t.realizedPnl}</th>
                 <th className="py-2 px-4">{t.time}</th>
               </tr>
            </thead>
            <tbody>
              {recentTrades.map(t2 => (
                <tr key={t2.id} className="border-b border-gray-100 dark:border-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/20">
                  <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{t2.symbol} / <span className={t2.side === 'BUY' ? 'text-trade-up' : 'text-trade-down'}>{t2.side === 'BUY' ? t.long : t.short}</span></td>
                  <td className="py-2 px-4 font-mono dark:text-white">{t2.price.toFixed(2)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{t2.amount.toFixed(4)}</td>
                  <td className="py-2 px-4 font-mono dark:text-white">{t2.total.toFixed(2)}</td>
                  <td className="py-2 px-4 font-mono text-rose-500">{t2.fee.toFixed(2)}</td>
                  <td className={`py-2 px-4 font-mono font-bold ${t2.pnl >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>{t2.pnl >= 0 ? '+' : ''}{t2.pnl.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-500">{t2.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'assetsHistory' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card z-10 border-b border-gray-200 dark:border-slate-800">
               <tr className="text-gray-500 uppercase">
                 <th className="py-2 px-4">{t.assetHeader}</th>
                 <th className="py-2 px-4">{t.type}</th>
                 <th className="py-2 px-4">{t.amount}</th>
                 <th className="py-2 px-4">{t.fee}</th>
                 <th className="py-2 px-4">{t.txHash}</th>
                 <th className="py-2 px-4">{t.status}</th>
                 <th className="py-2 px-4">{t.time}</th>
               </tr>
            </thead>
            <tbody>
              {assetHistory.map(a => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-slate-800/30">
                  <td className="py-2 px-4 dark:text-white">{a.asset}</td>
                  <td className="py-2 px-4 text-gray-500">{(t as any)[a.type] || a.type}</td>
                  <td className={`py-2 px-4 font-mono font-bold ${a.type === 'deposit' ? 'text-teal-500' : 'text-rose-500'}`}>{a.amount.toLocaleString()}</td>
                  <td className="py-2 px-4 text-rose-500 font-mono">{a.fee ? a.fee.toFixed(2) : '--'}</td>
                  <td className="py-2 px-4 font-mono text-brand-500 cursor-pointer hover:underline">{a.hash}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(a.status)}`}>{(t as any)[a.status] || a.status}</span></td>
                  <td className="py-2 px-4 text-gray-500">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'fundingHistory' ? (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 flex items-center">
               <div className="relative group">
                 <button className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded text-xs">
                   <Filter size={14} className="text-gray-400" />
                   <span>{(t as any)[fundingFilter] || t.all}</span>
                   <ChevronDown size={14} />
                 </button>
                 <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-20 hidden group-hover:block py-1">
                   {['all', 'tradingFee', 'fundingFee', 'realizedPnl', 'liquidationFee'].map(f => (
                     <button key={f} onClick={() => setFundingFilter(f)} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700">{(t as any)[f] || t.all}</button>
                   ))}
                 </div>
               </div>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr className="text-gray-500 uppercase border-b border-gray-200 dark:border-slate-800">
                  <th className="py-2 px-4">{t.time}</th>
                  <th className="py-2 px-4">{t.type}</th>
                  <th className="py-2 px-4">{t.amount} (USDC)</th>
                  <th className="py-2 px-4">{t.contract}</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunding.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/20">
                    <td className="py-2 px-4 text-gray-500">{r.time}</td>
                    <td className="py-2 px-4 dark:text-white">{(t as any)[r.type] || r.type}</td>
                    <td className={`py-2 px-4 font-mono font-bold ${r.amount >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>{r.amount >= 0 ? '+' : ''}{r.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 text-gray-400">{r.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">{(t as any)[activeTab] || activeTab} Demo Data</div>
        )}
      </div>

      {showCloseAllModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 dark:text-white">{t.closeAll}?</h3>
              <p className="text-sm text-gray-500 mb-6">{t.closeAllConfirm}</p>
              <div className="flex space-x-4">
                 <button onClick={() => setShowCloseAllModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-slate-700 rounded font-bold text-gray-500">{t.cancel}</button>
                 <button onClick={() => { onCloseAll(); setShowCloseAllModal(false); }} className="flex-1 py-2 bg-trade-down text-white rounded font-bold">{t.confirm}</button>
              </div>
           </div>
        </div>
      )}

      {closingPos && <CloseModal pos={closingPos} onClose={() => setClosingPos(null)} />}
    </div>
  );
};
