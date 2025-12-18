
import React, { useState, useEffect } from 'react';
import { Language, WalletProvider, Theme, Position } from '../types';
import { TRANSLATIONS, INITIAL_ACCOUNT_INFO } from '../constants';
import { X, Copy, ExternalLink, LogOut, Settings, Check, ArrowRightIcon, ShieldCheck, Mail, Loader2, Info } from 'lucide-react';
import { CustomSlider } from './TradeForm';

// Redesigned high-quality SVGs for Metamask and OKX
const MetaMaskLogo = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M239.31 16.711l-94.864 73.19 19.344 26.685 75.52-60.912v-.235l-2.73-3.181-.271-3.64.24-4.814-11.239-17.093z" fill="#e2761b"/><path d="M16.69 16.711l94.864 73.19-19.344 26.685-75.52-60.912v-.235l2.73-3.181.271-3.64-.24-4.814 11.239-17.093z" fill="#e4761b"/><path d="M205.5 174.5l-33.5 17.5-31.5-12.5-3.5-37.5 10.5-23.5 35.5 15.5 22.5 40.5z" fill="#d7c1b3"/><path d="M50.5 174.5l33.5 17.5 31.5-12.5 3.5-37.5-10.5-23.5-35.5 15.5-22.5 40.5z" fill="#d7c1b3"/><path d="M128 239.31l-34.864-32.19 12.344-12.685 22.52 16.912 22.52-16.912 12.344 12.685L128 239.31z" fill="#233447"/><path d="M128 128l32 32-32 48-32-48 32-32z" fill="#161616"/>
  </svg>
);
const OKXLogo = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="black"/>
    <rect x="20" y="20" width="25" height="25" fill="white"/>
    <rect x="55" y="20" width="25" height="25" fill="white"/>
    <rect x="20" y="55" width="25" height="25" fill="white"/>
    <rect x="55" y="55" width="25" height="25" fill="white"/>
  </svg>
);
const BinanceLogo = () => <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg" className="w-6 h-6" alt="binance" />;
const WalletConnectLogo = () => <img src="https://avatars.githubusercontent.com/u/37784886" className="w-6 h-6" alt="wc" />;

const ArbitrumLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#28A0F0"/>
    <path d="M12 4L4 16L12 20L20 16L12 4Z" fill="white" fillOpacity="0.2"/>
    <path d="M12 7L6 16L12 19L18 16L12 7Z" fill="white"/>
  </svg>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const AccountPopover: React.FC<{ onClose: () => void; lang: Language; onDisconnect: () => void; onDeposit: () => void; onWithdraw: () => void; }> = ({ onClose, lang, onDisconnect, onDeposit, onWithdraw }) => {
  const t = TRANSLATIONS[lang];
  const address = "0x4b34...55bs91";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("0x4b34...55bs91");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
       <div className="flex items-center space-x-3 mb-4">
          <MetaMaskLogo />
          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{address}</span>
          <button onClick={handleCopy} className={`transition relative ${copied ? 'text-red-500' : 'text-gray-400 hover:text-brand-500'}`}>
            {copied ? <Check size={18} /> : <Copy size={16} />}
          </button>
       </div>
       
       <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-lg p-4 mb-4">
          <div className="text-xs text-gray-500 mb-1">{t.accountBalance}</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">4,392.23 <span className="text-sm font-normal text-gray-500">USDC</span></div>
          <div className="flex space-x-2 mt-4">
             <button onClick={onDeposit} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-2 rounded text-sm transition-all">{t.deposit}</button>
             <button onClick={onWithdraw} className="flex-1 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 font-bold py-2 rounded text-sm transition-all">{t.withdraw}</button>
          </div>
       </div>

       <div className="space-y-3 pt-2">
          <button className="w-full flex items-center space-x-3 text-xs text-gray-500 hover:text-slate-100 py-1 transition">
             <ExternalLink size={14} /><span>{t.viewOnExplorer}</span>
          </button>
          <button onClick={onDisconnect} className="w-full flex items-center space-x-3 text-xs text-rose-500 hover:text-rose-400 py-1 transition">
             <LogOut size={14} /><span>{t.disconnect}</span>
          </button>
       </div>
    </div>
  );
};

export const SignatureModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; onSign: () => void }> = ({ isOpen, onClose, lang, onSign }) => {
  const t = TRANSLATIONS[lang];
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t.signatureReq}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center"><ShieldCheck size={48} className="text-brand-500" /></div>
        <p className="text-sm text-gray-500 dark:text-gray-300">{t.signMsg}</p>
        <button onClick={onSign} className="w-full py-3 bg-[#DCA85E] text-slate-900 font-bold rounded-lg shadow-lg hover:bg-[#c99750] transition-all">{t.signBtn}</button>
      </div>
    </BaseModal>
  );
};

export const EmailModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; onBind: () => void }> = ({ isOpen, onClose, lang, onBind }) => {
  const t = TRANSLATIONS[lang];
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setCode('888666'); // Mock auto-fill
      setIsSending(false);
    }, 800);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t.bindEmail}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
          <div className="flex space-x-2">
            <input type="email" placeholder="email@example.com" className="flex-1 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 text-sm outline-none dark:text-white" />
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="bg-brand-500 text-slate-900 font-bold text-xs px-3 rounded hover:bg-brand-600 transition disabled:opacity-50"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : t.sendCode}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">{t.verifyCode}</label>
          <input 
            type="text" 
            value={code} 
            onChange={e => setCode(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 text-sm outline-none dark:text-white font-mono" 
          />
        </div>
        <button 
          onClick={onBind} 
          disabled={code.length < 6}
          className="w-full py-3 bg-[#DCA85E] text-slate-900 font-bold rounded-lg hover:bg-[#c99750] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {t.confirm}
        </button>
      </div>
    </BaseModal>
  );
};

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; isEmailBound: boolean; onBindClick: () => void }> = ({ isOpen, onClose, lang, isEmailBound, onBindClick }) => {
  const t = TRANSLATIONS[lang];
  const [posMode, setPosMode] = useState('hedge');
  const [switches, setSwitches] = useState({ confirm: true, notify: true, email: false });

  const Toggle = ({ active, onToggle, disabled = false }: { active: boolean; onToggle: () => void, disabled?: boolean }) => (
    <div 
      onClick={disabled ? undefined : onToggle} 
      className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-brand-500' : 'bg-slate-700'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`} />
    </div>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t.settings}>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <span className="text-sm font-medium dark:text-white">{t.posMode}</span>
            <div className="flex bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-0.5 rounded-full w-24 relative cursor-pointer" onClick={() => setPosMode(p => p === 'oneWay' ? 'hedge' : 'oneWay')}>
               <div className={`absolute top-0.5 bottom-0.5 w-[44px] bg-brand-500 rounded-full transition-all ${posMode === 'hedge' ? 'left-[46px]' : 'left-0.5'}`} />
               <span className={`flex-1 text-[9px] font-black text-center z-10 py-1.5 transition ${posMode === 'oneWay' ? 'text-slate-900' : 'text-gray-500'}`}>{t.oneWay}</span>
               <span className={`flex-1 text-[9px] font-black text-center z-10 py-1.5 transition ${posMode === 'hedge' ? 'text-slate-900' : 'text-gray-500'}`}>{t.hedge}</span>
            </div>
         </div>
         <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm font-medium dark:text-white">{t.orderConfirm}</span><div className="flex justify-end"><Toggle active={switches.confirm} onToggle={() => setSwitches(s => ({...s, confirm: !s.confirm}))} /></div></div>
            <div className="flex items-center justify-between"><span className="text-sm font-medium dark:text-white">{t.popupNotify}</span><div className="flex justify-end"><Toggle active={switches.notify} onToggle={() => setSwitches(s => ({...s, notify: !s.notify}))} /></div></div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium dark:text-white">{t.emailNotify}</span>
              <div className="flex items-center space-x-2">
                {isEmailBound && (
                  <button onClick={onBindClick} className="text-brand-500 text-[10px] font-bold hover:underline">{t.modifyEmail}</button>
                )}
                <div className="flex justify-end">
                  <Toggle active={switches.email} onToggle={() => setSwitches(s => ({...s, email: !s.email}))} disabled={!isEmailBound} />
                </div>
                {!isEmailBound && (
                  <button onClick={onBindClick} className="bg-brand-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-600 transition">{t.bindEmail}</button>
                )}
              </div>
            </div>
         </div>
         <button onClick={onClose} className="w-full py-3 bg-[#DCA85E] text-slate-900 font-bold rounded-lg shadow-lg hover:bg-[#c99750] transition">{t.confirm}</button>
      </div>
    </BaseModal>
  );
};

export const WalletModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; onConnect: () => void; }> = ({ isOpen, onClose, lang, onConnect }) => {
  const t = TRANSLATIONS[lang];
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t.selectWallet}>
      <div className="space-y-3">
        {[
          { name: 'Metamask', icon: <MetaMaskLogo /> },
          { name: 'OKX Wallet', icon: <OKXLogo /> },
          { name: 'Binance Wallet', icon: <BinanceLogo /> },
          { name: 'WalletConnect', icon: <WalletConnectLogo /> }
        ].map(w => (
          <button key={w.name} onClick={onConnect} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl hover:border-brand-500 transition-all group dark:text-white">
            <div className="flex items-center space-x-3">{w.icon}<span className="font-bold">{w.name}</span></div>
            <ArrowRightIcon size={18} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
          </button>
        ))}
      </div>
    </BaseModal>
  );
};

export const AssetModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; type: 'deposit' | 'withdraw'; maxAmount: number; onConfirm: (v: number) => void; theme: Theme }> = ({ isOpen, onClose, lang, type, maxAmount, onConfirm, theme }) => {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState('');
  const [val, setVal] = useState(0);

  const numAmount = parseFloat(amount) || 0;
  const actualAmount = type === 'withdraw' ? Math.max(0, numAmount - 0.5) : numAmount;

  const handleSlider = (v: number) => { setVal(v); setAmount((maxAmount * v / 100).toFixed(2)); };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={type === 'deposit' ? t.deposit : t.withdraw}>
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>{t.amount}</span>
            <span>{type === 'deposit' ? (lang === 'zh-CN' ? '钱包可用' : 'Wallet Avail') : (lang === 'zh-CN' ? '可提现' : 'Avail to Withdraw')}: {maxAmount.toLocaleString()} USDC</span>
          </div>
          <div className="relative">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t.amount} className="w-full bg-transparent border border-gray-200 dark:border-slate-700 rounded p-2.5 pr-16 text-sm font-mono outline-none dark:text-white" />
            <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">USDC</span>
          </div>
          <div className="pt-2"><CustomSlider value={val} onChange={handleSlider} theme={theme} /></div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-500 uppercase">{t.network}</div>
          <div className="flex items-center space-x-3 border border-gray-200 dark:border-slate-700 p-2.5 rounded bg-gray-50 dark:bg-slate-800/50">
             <ArbitrumLogo />
             <span className="font-bold text-sm dark:text-white">Arbitrum</span>
          </div>
        </div>

        {type === 'deposit' ? (
           <p className="text-xs text-orange-500 font-medium">{t.depositTips}</p>
        ) : (
           <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-gray-500"><span>{t.withdrawFee}</span><span className="text-red-400">0.5 USDC</span></div>
              <div className="flex justify-between text-xs text-gray-500 font-bold"><span>{t.actualAmount}</span><span className="text-green-500 font-mono">{actualAmount.toFixed(2)} USDC</span></div>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
           <button onClick={onClose} className="py-2.5 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded transition">{t.cancel}</button>
           <button onClick={() => onConfirm(numAmount)} className="py-2.5 bg-[#8B5E14] hover:bg-[#7a5212] text-white font-bold rounded shadow-xl transition">{t.confirm}</button>
        </div>
      </div>
    </BaseModal>
  );
};

export const MarginManageModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; type: 'add' | 'extract'; pos: Position; theme: Theme; available: number; onConfirm: (v: number) => void; }> = ({ isOpen, onClose, lang, type, pos, theme, available, onConfirm }) => {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState('');
  const [sliderVal, setSliderVal] = useState(0);

  const numAmount = parseFloat(amount) || 0;
  const isAdd = type === 'add';
  const newMargin = isAdd ? pos.margin + numAmount : Math.max(0, pos.margin - numAmount);
  
  // Dynamic comparison calculations
  const notional = pos.size * pos.markPrice;
  const oldLeverage = notional / pos.margin;
  const newLeverage = newMargin > 0 ? notional / newMargin : oldLeverage;
  
  const oldLiq = pos.liquidationPrice;
  const liqDiff = (oldLiq * (numAmount / pos.margin)) * (isAdd ? -1 : 1);
  const newLiq = oldLiq + liqDiff;

  const oldMarginRate = (pos.margin / notional) * 100;
  const newMarginRate = (newMargin / notional) * 100;

  const handleSlider = (v: number) => { setSliderVal(v); setAmount((available * v / 100).toFixed(2)); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#1a1c22] border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
           <h3 className="text-lg font-bold dark:text-white">{isAdd ? t.addMargin : t.removeMargin}</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
           <div className="flex flex-col border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-500">{t.contract}</span>
                <span className="font-bold text-[#10B981] font-mono">{pos.symbol} / {pos.side === 'BUY' ? t.long : t.short}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{t.entryPrice}: <span className="font-mono">{pos.entryPrice.toFixed(2)}</span></span>
                <span>{t.markPrice}: <span className="font-mono">{pos.markPrice.toFixed(2)}</span></span>
              </div>
           </div>
           
           <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                 <span>{t.amount}</span>
                 <span>{isAdd ? t.avail : t.availExtract}: {available.toLocaleString()} USDC</span>
              </div>
              <div className="relative">
                 <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t.amount} className="w-full bg-transparent border border-gray-200 dark:border-slate-700 rounded p-2.5 pr-14 text-sm font-mono focus:border-brand-500 outline-none dark:text-white" />
                 <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">USDC</span>
              </div>
              <div className="pt-2"><CustomSlider value={sliderVal} onChange={handleSlider} theme={theme} /></div>
           </div>

           <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500">{t.margin}</span>
                 <div className="flex items-center space-x-3 font-mono font-bold dark:text-white">
                    <span>{pos.margin.toFixed(2)}</span><ArrowRightIcon size={12} className="text-[#10B981]" /><span>{newMargin.toFixed(2)}</span>
                 </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500">{t.liqPrice}</span>
                 <div className="flex items-center space-x-3 font-mono font-bold dark:text-white">
                    <span>{pos.liquidationPrice.toFixed(2)}</span><ArrowRightIcon size={12} className="text-[#10B981]" /><span>{newLiq.toFixed(2)}</span>
                 </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500">{t.leverage}</span>
                 <div className="flex items-center space-x-3 font-mono font-bold dark:text-white">
                    <span>{oldLeverage.toFixed(2)}x</span><ArrowRightIcon size={12} className="text-[#10B981]" /><span>{newLeverage.toFixed(2)}x</span>
                 </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500">{t.marginRate}</span>
                 <div className="flex items-center space-x-3 font-mono font-bold dark:text-white">
                    <span>{oldMarginRate.toFixed(2)}%</span><ArrowRightIcon size={12} className="text-[#10B981]" /><span>{newMarginRate.toFixed(2)}%</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={onClose} className="py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition">{t.cancel}</button>
              <button 
                onClick={() => onConfirm(numAmount)} 
                disabled={numAmount <= 0 || numAmount > available}
                className="py-3 bg-[#8B5E14] hover:bg-[#7a5212] text-white font-bold rounded-lg shadow-xl shadow-[#8B5E14]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.confirm}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
