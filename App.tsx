
import React, { useState } from 'react';
import { Header } from './components/Header';
import { MarketStats } from './components/MarketStats';
import { CandleChart } from './components/CandleChart';
import { OrderBook } from './components/OrderBook';
import { TradeForm } from './components/TradeForm';
import { PositionTable } from './components/PositionTable';
import { AccountInfo } from './components/AccountInfo';
import { NotificationContainer, RichNotification } from './components/Notification';
import { WalletModal, AssetModal, MarginManageModal, SignatureModal, SettingsModal, EmailModal } from './components/Modals';
import { INITIAL_MARKET_DATA, MOCK_POSITIONS, TRANSLATIONS, INITIAL_ACCOUNT_INFO, MOCK_ASSETS_HISTORY } from './constants';
import { Language, Theme, MarketData, Position, Order, OrderSide, OrderType, MarginMode, AccountInfo as AccountInfoType } from './types';
import { Volume2 } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('zh-CN');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isConnected, setIsConnected] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isEmailBound, setIsEmailBound] = useState(false);
  const [marketData, setMarketData] = useState<MarketData>(INITIAL_MARKET_DATA);
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assetHistory, setAssetHistory] = useState(MOCK_ASSETS_HISTORY);
  const [notifications, setNotifications] = useState<RichNotification[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfoType>(INITIAL_ACCOUNT_INFO);

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const [assetModal, setAssetModal] = useState<{ isOpen: boolean, type: 'deposit' | 'withdraw' }>({ isOpen: false, type: 'deposit' });
  const [marginManage, setMarginManage] = useState<{ isOpen: boolean; type: 'add' | 'extract'; pos: Position | null }>({ isOpen: false, type: 'add', pos: null });

  // State for populating price from OrderBook to TradeForm
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const addRichNotification = (type: RichNotification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const handleConnectClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = () => {
    setShowWalletModal(false);
    setShowSignModal(true);
  };

  const handleSign = () => {
    setShowSignModal(false);
    setIsConnected(true);
    setIsSigned(true);
    const title = lang === 'en' ? 'Welcome Back' : (lang === 'zh-CN' ? '欢迎回来' : '歡迎回來');
    const body = lang === 'en' ? 'Wallet connected and signed successfully.' : '钱包连接并签名成功。';
    addRichNotification('success', title, body);
  };

  const handleOrder = (side: OrderSide, type: OrderType, size: number, price: number, leverage: number, marginMode: MarginMode) => {
    if (!isSigned) { setShowWalletModal(true); return; }
    
    if (type === OrderType.MARKET) {
      const newPos: Position = { id: Date.now().toString(), symbol: marketData.symbol, side, size, entryPrice: price, markPrice: price, leverage, margin: (size * price) / leverage, marginMode, pnl: 0, pnlPercent: 0, liquidationPrice: side === OrderSide.BUY ? price * 0.8 : price * 1.2 };
      setPositions(prev => [newPos, ...prev]);
      
      const title = lang === 'en' ? 'Market Order Filled' : (lang === 'zh-CN' ? '市价单已完全成交' : '市價單已完全成交');
      const body = lang === 'en' 
        ? `Market ${side === OrderSide.BUY ? 'Buy' : 'Sell'} ${size.toFixed(2)} XAU fully filled.\nAvg Price $${price.toFixed(2)} | Fee $${(size * price * 0.0005).toFixed(2)}`
        : `市价${side === OrderSide.BUY ? '买入' : '卖出'} ${size.toFixed(2)} ${marketData.symbol.replace('USDC', '')} 已完全成交\n平均成交价 $${price.toFixed(2)} | 手续费 $${(size * price * 0.0005).toFixed(2)}`;
      addRichNotification('success', title, body);
    } else {
      const newOrder: Order = {
        id: Date.now().toString(),
        symbol: marketData.symbol,
        side,
        type: OrderType.LIMIT,
        price,
        amount: size,
        filled: 0,
        leverage,
        status: 'OPEN',
        time: new Date().toLocaleString()
      };
      setOrders(prev => [newOrder, ...prev]);

      const title = lang === 'en' ? 'Order Created' : (lang === 'zh-CN' ? '下单成功' : '下單成功');
      const sideStr = lang === 'en' ? (side === OrderSide.BUY ? 'Buy' : 'Sell') : (side === OrderSide.BUY ? '买入' : '卖出');
      const body = lang === 'en'
        ? `You have successfully submitted ${marketData.symbol} ${sideStr} Limit Order.\nPrice $${price.toLocaleString()} | Amount ${size} XAU | Leverage ${leverage}x`
        : `您已成功提交${marketData.symbol} ${sideStr} 限价单\n价格 $${price.toLocaleString()} | 数量 ${size} ${marketData.symbol.replace('USDC', '')} | 杠杆 ${leverage}x`;
      addRichNotification('success', title, body);
    }
  };

  const handleClosePosition = (id: string, type: OrderType, closePrice?: number, closeAmount?: number) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    setPositions(prev => prev.filter(x => x.id !== id));
    
    const title = lang === 'en' ? 'Position Closed' : (lang === 'zh-CN' ? '仓位已平仓' : '倉位已平倉');
    const sideStr = lang === 'en' ? (pos.side === OrderSide.BUY ? 'Long' : 'Short') : (pos.side === OrderSide.BUY ? '多头' : '空头');
    const body = lang === 'en'
      ? `Successfully closed ${pos.symbol} ${sideStr}.\nClosed Amount ${pos.size} XAU | Realized PnL +$${pos.pnl.toFixed(2)}`
      : `您已成功平仓 ${pos.symbol} ${sideStr}\n平仓数量 ${pos.size} ${pos.symbol.replace('USDC', '')} | 实现盈亏 +$${pos.pnl.toFixed(2)}`;
    addRichNotification('success', title, body);
  };

  const handleAssetConfirm = (type: 'deposit' | 'withdraw', v: number) => {
     // Note: v is the USDC equivalent for Swap/Deposit, or requested amount for Withdraw
     const status = type === 'deposit' ? 'completed' : (v >= 100 ? 'reviewing' : 'completed');
     const newRecord = {
        id: Date.now().toString(),
        asset: 'USDC',
        type,
        amount: v,
        fee: type === 'withdraw' ? 0.5 : null,
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        status,
        time: new Date().toISOString().replace('T', ' ').slice(0, 19)
     };
     setAssetHistory(prev => [newRecord, ...prev]);
     setAssetModal(m => ({ ...m, isOpen: false }));

     if (type === 'deposit') {
       const title = lang === 'en' ? 'Deposit Success' : (lang === 'zh-CN' ? '充值成功' : '充值成功');
       const body = lang === 'en' 
        ? `You have successfully deposited ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC, please check.`
        : `您已成功充值 ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC，请查看`;
       addRichNotification('success', title, body);
     } else {
       const title = lang === 'en' ? 'Withdrawal Success' : (lang === 'zh-CN' ? '提现成功' : '提現成功');
       const body = lang === 'en'
        ? `You have successfully withdrawn ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC to 0x4b...5591 (Arbitrum), estimated arrival in 1 minute.`
        : `您已成功提现 ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC 至 0x4b...5591 (Arbitrum)，预计 1 分钟到账。`;
       addRichNotification('success', title, body);
     }
  };

  const simulateLiquidation = () => {
    const title = lang === 'en' ? 'Position Liquidated' : (lang === 'zh-CN' ? '仓位已强平' : '倉位已強平');
    const body = lang === 'en'
      ? `Your ${marketData.symbol} Long position triggered liquidation at $2,800. $428 Liquidation fee deducted.`
      : `您的 ${marketData.symbol} 多头仓位已触发强平，强平价格 $2,800，已扣除 $428 强平罚金。`;
    addRichNotification('liquidation', title, body);
  };

  return (
    <div className={`flex flex-col h-screen ${theme} bg-gray-50 dark:bg-dark-bg text-slate-900 dark:text-slate-200 font-sans overflow-hidden transition-colors`}>
      <Header 
        lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
        isConnected={isSigned} 
        onConnectClick={handleConnectClick} 
        onDeposit={() => setAssetModal({ isOpen: true, type: 'deposit' })}
        onWithdraw={() => setAssetModal({ isOpen: true, type: 'withdraw' })}
        onDisconnect={() => { setIsConnected(false); setIsSigned(false); setPositions([]); setOrders([]); }}
      />
      
      {/* Broadcast Banner - Optimized for both light and dark themes */}
      <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 px-4 py-2 flex items-center shrink-0 z-40 border-b border-amber-200 dark:border-amber-900/50">
        <Volume2 size={16} className="mr-3 shrink-0 text-amber-500 dark:text-amber-400" />
        <p className="text-sm font-semibold tracking-wide">
          {lang === 'en' 
            ? 'Predict gold trends · Seize the next market movement, next-gen gold prediction market >>'
            : (lang === 'zh-CN' ? '预测金价走势 · 抢占下一个黄金行情，新一代黄金预测市场>>' : '預測金價走勢 · 搶佔下一個黃金行情，新一代黃金預測市場>>')}
        </p>
      </div>

      <MarketStats data={marketData} lang={lang} onMarketSelect={setMarketData} />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-[1.8] flex border-b border-gray-200 dark:border-dark-border">
            <div className="flex-1 relative border-r border-gray-200 dark:border-dark-border">
              <CandleChart lang={lang} currentMarket={marketData} />
              <button 
                onClick={simulateLiquidation}
                className="absolute bottom-4 left-4 bg-rose-600/20 hover:bg-rose-600/40 text-rose-500 text-[10px] px-2 py-1 rounded border border-rose-500/30 font-bold transition-all z-20"
              >
                Simulate Liq.
              </button>
            </div>
            <div className="w-[280px] hidden lg:block bg-white dark:bg-dark-card shrink-0">
              <OrderBook lang={lang} lastPrice={marketData.lastPrice} onPriceClick={(p) => setSelectedPrice(p.toFixed(2))} />
            </div>
          </div>
          <div className="flex-[2] min-h-[250px] flex flex-col overflow-hidden">
             <PositionTable 
               positions={positions} orders={orders} assetHistory={assetHistory} lang={lang} theme={theme}
               onClosePosition={handleClosePosition}
               onCancelOrder={(id) => setOrders(o => o.filter(x => x.id !== id))}
               onEditMargin={(pos, type) => setMarginManage({ isOpen: true, type, pos })}
               onCloseAll={() => setPositions([])}
               onCancelAll={() => setOrders([])}
             />
          </div>
        </div>
        <div className="w-[340px] flex flex-col border-l border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card z-30 shrink-0">
          <div className="flex-1 overflow-y-auto">
            <TradeForm 
              lang={lang} 
              theme={theme} 
              isConnected={isSigned} 
              onConnect={() => setShowWalletModal(true)} 
              onOrder={handleOrder} 
              lastPrice={marketData.lastPrice} 
              availableBalance={accountInfo.marginBalance} 
              currentSymbol={marketData.symbol} 
              selectedPrice={selectedPrice}
            />
          </div>
          <div className="shrink-0 border-t border-gray-200 dark:border-dark-border"><AccountInfo lang={lang} info={accountInfo} /></div>
        </div>
      </main>

      <NotificationContainer notifications={notifications} removeNotification={(id) => setNotifications(n => n.filter(x => x.id !== id))} />
      
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} lang={lang} onConnect={handleWalletSelect} />
      <SignatureModal isOpen={showSignModal} onClose={() => setShowSignModal(false)} lang={lang} onSign={handleSign} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} lang={lang} isEmailBound={isEmailBound} onBindClick={() => setShowEmailModal(true)} />
      <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} lang={lang} onBind={() => { setIsEmailBound(true); setShowEmailModal(false); }} />

      <AssetModal 
        isOpen={assetModal.isOpen} 
        onClose={() => setAssetModal(prev => ({ ...prev, isOpen: false }))} 
        lang={lang} 
        type={assetModal.type} 
        maxAmount={1000.00} 
        onConfirm={(v) => handleAssetConfirm(assetModal.type, v)} 
        theme={theme}
      />
      
      {marginManage.isOpen && marginManage.pos && (
         <MarginManageModal 
            isOpen={true} onClose={() => setMarginManage(m => ({...m, isOpen: false}))}
            lang={lang} theme={theme} type={marginManage.type} pos={marginManage.pos}
            available={marginManage.type === 'add' ? accountInfo.marginBalance : marginManage.pos.margin - 100}
            onConfirm={(v) => {
              setPositions(prev => prev.map(p => p.id === marginManage.pos?.id ? { ...p, margin: marginManage.type === 'add' ? p.margin + v : p.margin - v } : p));
              setMarginManage(m => ({ ...m, isOpen: false }));
              addRichNotification('success', lang === 'en' ? 'Margin Adjusted' : '保证金调整成功', `${marginManage.type === 'add' ? 'Added' : 'Removed'} ${v} USDC margin.`);
            }}
         />
      )}
    </div>
  );
}
