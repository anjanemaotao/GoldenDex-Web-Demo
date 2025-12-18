
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CHART_DATA, MOCK_ASKS, MOCK_BIDS, TRANSLATIONS, TIMEFRAMES } from '../constants';
import { Language } from '../types';
import { ChevronDown, LineChart as LineIcon, BarChart2, Layers } from 'lucide-react';

type ChartType = 'line' | 'candle' | 'depth';
type PriceSourceKey = 'lastPrice' | 'markPrice' | 'indexPrice';

interface CandleChartProps {
  lang: Language;
}

const CandleStickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#10B981' : '#F43F5E';
  
  const bodyLength = Math.abs(close - open);
  const pixelsPerUnit = bodyLength === 0 ? 0 : height / bodyLength;
  
  let wickTop = y;
  let wickBottom = y + height;
  
  if (pixelsPerUnit > 0) {
      const highDiff = high - Math.max(open, close);
      const lowDiff = Math.min(open, close) - low;
      wickTop = y - (highDiff * pixelsPerUnit);
      wickBottom = y + height + (lowDiff * pixelsPerUnit);
  }

  return (
    <g>
      <line x1={x + width / 2} y1={wickTop} x2={x + width / 2} y2={wickBottom} stroke={color} strokeWidth={1} />
      <rect x={x} y={y} width={width} height={Math.max(1, height)} fill={color} stroke="none"/>
    </g>
  );
};

export const CandleChart: React.FC<CandleChartProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [timeframe, setTimeframe] = useState('15m');
  const [priceSourceKey, setPriceSourceKey] = useState<PriceSourceKey>('lastPrice');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Data Simulation
  const [liveData, setLiveData] = useState(CHART_DATA);
  const [liveAsks, setLiveAsks] = useState(MOCK_ASKS);
  const [liveBids, setLiveBids] = useState(MOCK_BIDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 5;
        const newClose = last.close + change;
        const newOpen = last.close;
        const newHigh = Math.max(newOpen, newClose) + Math.random() * 2;
        const newLow = Math.min(newOpen, newClose) - Math.random() * 2;
        
        return [...prev.slice(1), {
          ...last,
          time: last.time + 1,
          open: newOpen,
          close: newClose,
          high: newHigh,
          low: newLow
        }];
      });

      // Simulating depth updates
      setLiveAsks(prev => prev.map(a => ({ ...a, amount: (parseFloat(a.amount) + (Math.random() - 0.5)).toFixed(3) })));
      setLiveBids(prev => prev.map(b => ({ ...b, amount: (parseFloat(b.amount) + (Math.random() - 0.5)).toFixed(3) })));

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayData = useMemo(() => {
    if (chartType === 'depth') {
        const bids = [...liveBids]
            .sort((a, b) => b.price - a.price)
            .reduce((acc: any[], item) => {
                const prevTotal = acc.length > 0 ? parseFloat(acc[acc.length - 1].total) : 0;
                const total = prevTotal + parseFloat(item.amount);
                acc.push({ price: item.price, bidTotal: total, total: total.toFixed(3) });
                return acc;
            }, [])
            .reverse();
            
        const asks = [...liveAsks]
            .sort((a, b) => a.price - b.price)
            .reduce((acc: any[], item) => {
                const prevTotal = acc.length > 0 ? parseFloat(acc[acc.length - 1].total) : 0;
                const total = prevTotal + parseFloat(item.amount);
                acc.push({ price: item.price, askTotal: total, total: total.toFixed(3) });
                return acc;
            }, []);

        return [
            ...bids.map(b => ({ ...b, askTotal: null })), 
            ...asks.map(a => ({ ...a, bidTotal: null }))
        ].sort((a, b) => a.price - b.price);
    } else {
        return liveData.map(d => {
            let val = d.close;
            if (priceSourceKey === 'markPrice') val = d.close * 1.0005;
            if (priceSourceKey === 'indexPrice') val = d.close * 0.9995;
            return {
                ...d,
                displayPrice: val,
                body: [Math.min(d.open, d.close), Math.max(d.open, d.close)]
            };
        });
    }
  }, [chartType, priceSourceKey, liveData, liveAsks, liveBids]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-dark-bg relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-slate-800">
         <div className="flex space-x-1 overflow-x-auto hide-scrollbar mr-2">
           {TIMEFRAMES.map(tf => (
             <button
               key={tf}
               onClick={() => setTimeframe(tf)}
               className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                 timeframe === tf 
                   ? 'text-brand-500 bg-brand-500/10' 
                   : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-slate-200'
               }`}
             >
               {tf}
             </button>
           ))}
         </div>

         <div className="flex items-center space-x-3 shrink-0">
             <div className="flex bg-gray-100 dark:bg-slate-800 rounded p-0.5">
               <button onClick={() => setChartType('line')} className={`p-1.5 rounded transition-colors ${chartType === 'line' ? 'bg-white dark:bg-slate-600 text-brand-500 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                 <LineIcon size={14} />
               </button>
               <button onClick={() => setChartType('candle')} className={`p-1.5 rounded transition-colors ${chartType === 'candle' ? 'bg-white dark:bg-slate-600 text-brand-500 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                 <BarChart2 size={14} />
               </button>
               <button onClick={() => setChartType('depth')} className={`p-1.5 rounded transition-colors ${chartType === 'depth' ? 'bg-white dark:bg-slate-600 text-brand-500 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                 <Layers size={14} />
               </button>
             </div>

             <div className="relative" ref={dropdownRef}>
                 <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
                 >
                     <span>{t[priceSourceKey]}</span>
                     <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isDropdownOpen && (
                   <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50">
                       {(['lastPrice', 'markPrice', 'indexPrice'] as PriceSourceKey[]).map(key => (
                           <button
                              key={key}
                              onClick={() => {
                                setPriceSourceKey(key);
                                setIsDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-slate-800 ${
                                  priceSourceKey === key ? 'text-brand-500' : 'text-slate-700 dark:text-slate-300'
                              }`}
                           >
                               {t[key]}
                           </button>
                       ))}
                   </div>
                 )}
             </div>
         </div>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis orientation="right" domain={['auto', 'auto']} tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} width={50} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#EAB308' }}
                  formatter={(value: number) => [value.toFixed(2), t[priceSourceKey]]}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="displayPrice" stroke="#EAB308" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={true} animationDuration={500} />
              </AreaChart>
          ) : chartType === 'candle' ? (
              <BarChart data={displayData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                 <XAxis dataKey="time" hide />
                 <YAxis orientation="right" domain={['dataMin - 5', 'dataMax + 5']} tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} width={50} />
                 <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                 <Bar dataKey="body" shape={<CandleStickShape />} isAnimationActive={true} animationDuration={500} />
              </BarChart>
          ) : (
              <AreaChart data={displayData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                 <XAxis dataKey="price" type="number" domain={['auto', 'auto']} tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} tickCount={6} />
                 <YAxis orientation="right" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} width={50} />
                 <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#f1f5f9' }} />
                 <Area type="step" dataKey="bidTotal" stroke="#10B981" fill="#10B981" fillOpacity={0.3} strokeWidth={2} name="Bid Depth" isAnimationActive={true} animationDuration={500} />
                 <Area type="step" dataKey="askTotal" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.3} strokeWidth={2} name="Ask Depth" isAnimationActive={true} animationDuration={500} />
              </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
         <div className="text-8xl font-bold text-slate-900 dark:text-white">GOLD</div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
   if (active && payload && payload.length) {
       const d = payload[0].payload;
       return (
           <div className="bg-dark-card border border-dark-border p-2 rounded shadow-lg text-xs">
               <div className="text-gray-400 mb-1">Time: {d.time}</div>
               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <span className="text-gray-400">O:</span> <span className={d.open < d.close ? 'text-trade-up' : 'text-trade-down'}>{d.open.toFixed(2)}</span>
                   <span className="text-gray-400">H:</span> <span className="text-slate-200">{d.high.toFixed(2)}</span>
                   <span className="text-gray-400">L:</span> <span className="text-slate-200">{d.low.toFixed(2)}</span>
                   <span className="text-gray-400">C:</span> <span className={d.open < d.close ? 'text-trade-up' : 'text-trade-down'}>{d.close.toFixed(2)}</span>
               </div>
           </div>
       );
   }
   return null;
};
