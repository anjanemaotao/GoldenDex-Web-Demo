
import React, { useState, useEffect } from 'react';
import { MOCK_ASKS, MOCK_BIDS, TRANSLATIONS, INITIAL_MARKET_DATA } from '../constants';
import { Language } from '../types';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface OrderBookProps {
  lang: Language;
  lastPrice: number;
}

const Row = ({ price, amount, total, type }: { price: number, amount: string, total: string, type: 'ask' | 'bid' }) => {
  const bgClass = type === 'ask' ? 'bg-trade-down' : 'bg-trade-up';
  const textClass = type === 'ask' ? 'text-trade-down' : 'text-trade-up';
  const width = Math.min(parseFloat(total) * 1, 100); 

  return (
    <div className="grid grid-cols-3 text-xs py-1 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors relative group items-center">
      <div 
        className={`absolute top-0 right-0 h-full opacity-10 transition-all duration-300 ${bgClass}`} 
        style={{ width: `${width}%` }} 
      />
      <div className={`text-left pl-2 ${textClass} z-10 font-mono`}>{price.toFixed(2)}</div>
      <div className="text-right text-slate-700 dark:text-slate-300 z-10 font-mono">{amount}</div>
      <div className="text-right pr-2 text-slate-500 dark:text-gray-400 z-10 font-mono">{total}</div>
    </div>
  );
};

export const OrderBook: React.FC<OrderBookProps> = ({ lang, lastPrice: initialLastPrice }) => {
  const t = TRANSLATIONS[lang];
  const [tab, setTab] = useState<'book' | 'trades'>('book');
  const [asks, setAsks] = useState(MOCK_ASKS);
  const [bids, setBids] = useState(MOCK_BIDS);
  const [lastPrice, setLastPrice] = useState(initialLastPrice);
  const [trades, setTrades] = useState<any[]>([]);

  // Simulation effect for Order Book and Trades
  useEffect(() => {
    // Initial trades
    const initialTrades = Array.from({ length: 15 }, (_, i) => ({
      id: `initial-${i}`,
      price: initialLastPrice + (Math.random() - 0.5) * 5,
      amount: (Math.random() * 2).toFixed(3),
      time: new Date(Date.now() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      side: Math.random() > 0.5 ? 'BUY' : 'SELL'
    }));
    setTrades(initialTrades);

    const interval = setInterval(() => {
      // Update Price
      const priceChange = (Math.random() - 0.5) * 0.5;
      const newPrice = lastPrice + priceChange;
      setLastPrice(newPrice);

      // Update Order Book
      setAsks(prev => prev.map(a => ({
         ...a,
         amount: Math.max(0.1, parseFloat(a.amount) + (Math.random() - 0.5)).toFixed(3),
         total: Math.max(1, parseFloat(a.total) + (Math.random() - 0.5) * 2).toFixed(3)
      })));
      setBids(prev => prev.map(b => ({
         ...b,
         amount: Math.max(0.1, parseFloat(b.amount) + (Math.random() - 0.5)).toFixed(3),
         total: Math.max(1, parseFloat(b.total) + (Math.random() - 0.5) * 2).toFixed(3)
      })));

      // Occasional new trade
      if (Math.random() > 0.4) {
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const newTrade = {
          id: Date.now().toString(),
          price: newPrice,
          amount: (Math.random() * 1.2).toFixed(3),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          side
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 20));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPrice, initialLastPrice]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border overflow-hidden select-none">
      <div className="flex border-b border-gray-200 dark:border-dark-border shrink-0">
        <button 
          onClick={() => setTab('book')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'book' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500'}`}
        >
          {t.orderBook}
        </button>
        <button 
          onClick={() => setTab('trades')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'trades' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500'}`}
        >
          {t.recentTrades}
        </button>
      </div>

      <div className="grid grid-cols-3 text-[10px] text-gray-500 dark:text-gray-400 px-2 py-2 font-semibold shrink-0 uppercase tracking-tighter">
        <div className="text-left">{t.price}</div>
        <div className="text-right">{t.amount}</div>
        <div className="text-right pr-2">{tab === 'book' ? t.total : t.time}</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'book' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col justify-end overflow-hidden">
              {asks.slice(0, 12).map((ask, i) => (
                <Row key={`ask-${i}`} {...ask} price={ask.price} type="ask" />
              ))}
            </div>
            
            <div className="py-2 my-1 border-y border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 shrink-0 flex items-center justify-center space-x-4">
               <div className="flex items-center space-x-1">
                 <span className={`text-xl font-bold font-mono ${lastPrice >= initialLastPrice ? 'text-trade-up' : 'text-trade-down'}`}>{lastPrice.toFixed(2)}</span>
                 {lastPrice >= initialLastPrice ? <ArrowUp size={16} className="text-trade-up" /> : <ArrowDown size={16} className="text-trade-down" />}
               </div>
               <div className="text-[11px] text-slate-500 font-mono mt-0.5">{INITIAL_MARKET_DATA.markPrice.toFixed(2)}</div>
            </div>

            <div className="overflow-hidden">
               {bids.slice(0, 12).map((bid, i) => (
                <Row key={`bid-${i}`} {...bid} price={bid.price} type="bid" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar">
             {trades.map((trade) => (
               <div key={trade.id} className="grid grid-cols-3 text-xs py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors px-2">
                 <div className={`text-left font-mono font-bold ${trade.side === 'BUY' ? 'text-trade-up' : 'text-trade-down'}`}>
                   {trade.price.toFixed(2)}
                 </div>
                 <div className="text-right text-slate-700 dark:text-slate-300 font-mono">
                   {trade.amount}
                 </div>
                 <div className="text-right text-slate-500 dark:text-gray-400 font-mono">
                   {trade.time}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
