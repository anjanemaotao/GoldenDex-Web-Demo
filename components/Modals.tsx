
import React, { useState, useEffect, useRef } from 'react';
import { Language, WalletProvider, Theme, Position } from '../types';
import { TRANSLATIONS, INITIAL_ACCOUNT_INFO } from '../constants';
import { X, Copy, ExternalLink, LogOut, Settings, Check, ArrowRightIcon, ShieldCheck, Mail, Loader2, Info, ChevronDown } from 'lucide-react';
import { CustomSlider } from './TradeForm';

// Token Icons for the selector
const TokenIcons: Record<string, React.ReactNode> = {
  USDC: <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg" className="w-5 h-5" alt="usdc" />,
  ETH: <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" className="w-5 h-5" alt="eth" />,
  ARB: <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.svg" className="w-5 h-5" alt="arb" />,
  USDT: <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg" className="w-5 h-5" alt="usdt" />,
};

// Mock balances for various tokens
const MOCK_WALLET_BALANCES: Record<string, number> = {
  USDC: 25000.00,
  ETH: 12.45,
  ARB: 8420.00,
  USDT: 4210.50,
};

// Replaced fixed Logo components with IMG tags using specified URLs
const MetaMaskLogo = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
    className="w-6 h-6 object-contain" 
    alt="MetaMask" 
  />
);
const OKXLogo = () => (
  <img 
    src="https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png" 
    className="w-6 h-6 object-contain rounded-full" 
    alt="OKX" 
  />
);
const BinanceLogo = () => (
  <img 
    src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=024" 
    className="w-6 h-6 object-contain" 
    alt="Binance" 
  />
);
const WalletConnectLogo = () => (
  <img 
    src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg" 
    className="w-6 h-6 object-contain" 
    alt="WalletConnect" 
  />
);

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
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [processingState, setProcessingState] = useState<null | 'approving' | 'swapping' | 'depositing' | 'withdrawing'>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  const tokens = ['USDC', 'ETH', 'ARB', 'USDT'];
  const currentWalletBalance = MOCK_WALLET_BALANCES[selectedToken] || 0;

  const numAmount = parseFloat(amount) || 0;
  const isQuickSwap = type === 'deposit' && selectedToken !== 'USDC';
  
  // Calculate estimation for Swap
  const getConvertedValue = () => {
    if (!isQuickSwap) return numAmount;
    const rate = selectedToken === 'ETH' ? 3245 : selectedToken === 'ARB' ? 0.82 : 1.0;
    return numAmount * rate;
  };

  const actualReceivedUSDC = getConvertedValue();
  const actualAmount = type === 'withdraw' ? Math.max(0, numAmount - 0.5) : numAmount;

  const handleSlider = (v: number) => { 
    setVal(v); 
    setAmount((currentWalletBalance * v / 100).toFixed(selectedToken === 'ETH' ? 4 : 2)); 
    setHasError(false);
  };

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setHasError(true);
      return;
    }

    if (type === 'deposit') {
      // Simulation steps for Deposit
      if (selectedToken !== 'ETH') {
        setProcessingState('approving');
        await new Promise(r => setTimeout(r, 1500));
      }
      
      if (selectedToken !== 'USDC') {
        setProcessingState('swapping');
        await new Promise(r => setTimeout(r, 1500));
      }

      setProcessingState('depositing');
      await new Promise(r => setTimeout(r, 1500));
    } else {
      setProcessingState('withdrawing');
      await new Promise(r => setTimeout(r, 2000));
    }

    onConfirm(actualReceivedUSDC);
    setAmount('');
    setVal(0);
    setHasError(false);
    setProcessingState(null);
  };

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setAmount('');
      setVal(0);
      setProcessingState(null);
      if (type === 'withdraw') {
        setSelectedToken('USDC');
      }
    }
  }, [isOpen, type]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setTokenSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getButtonText = () => {
    if (processingState === 'approving') return t.approvingToken.replace('{token}', selectedToken);
    if (processingState === 'swapping') return t.swappingToken;
    if (processingState === 'withdrawing') return t.withdrawingToken;
    if (processingState === 'depositing') return t.depositingToVault;
    if (isQuickSwap) return t.swap;
    return t.confirm;
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={type === 'deposit' ? t.deposit : t.withdraw}>
      <div className="space-y-5">
        {/* Network */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-500 uppercase">{t.network}</div>
          <div className="flex items-center justify-between border border-gray-200 dark:border-slate-700 p-2.5 rounded bg-gray-50 dark:bg-slate-800/50">
             <div className="flex items-center space-x-3">
               <ArbitrumLogo />
               <span className="font-bold text-sm dark:text-white">Arbitrum</span>
             </div>
          </div>
        </div>

        {/* Token Selector */}
        {type === 'deposit' ? (
          <div className="space-y-2 relative" ref={selectorRef}>
            <div className="text-xs font-bold text-gray-500 uppercase">{t.selectToken}</div>
            <button 
              onClick={() => !processingState && setTokenSelectorOpen(!tokenSelectorOpen)}
              disabled={!!processingState}
              className={`w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-brand-500 transition-all dark:text-white ${processingState ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                {TokenIcons[selectedToken]}
                <span className="font-bold">{selectedToken}</span>
                {isQuickSwap && (
                  <div className="flex items-center space-x-1 text-[10px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded font-black ml-1">
                    <Info size={10} />
                    <span>Auto-Swap to USDC</span>
                  </div>
                )}
              </div>
              <ChevronDown size={18} className={`transition-transform ${tokenSelectorOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {tokenSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {tokens.map(tk => (
                  <button 
                    key={tk}
                    onClick={() => {
                      setSelectedToken(tk);
                      setTokenSelectorOpen(false);
                      setAmount('');
                      setVal(0);
                      setHasError(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${selectedToken === tk ? 'bg-brand-500/10' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      {TokenIcons[tk]}
                      <span className={`font-bold ${selectedToken === tk ? 'text-brand-500' : 'dark:text-white'}`}>{tk}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold dark:text-white">{MOCK_WALLET_BALANCES[tk].toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{tk}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
           <div className="space-y-2">
             <div className="text-xs font-bold text-gray-500 uppercase">{t.selectToken}</div>
             <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg dark:text-white opacity-80">
               {TokenIcons.USDC}
               <span className="font-bold">USDC</span>
             </div>
           </div>
        )}

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>{t.amount}</span>
            <span>{type === 'deposit' ? t.walletBalance : (lang === 'zh-CN' ? '可提现' : 'Avail to Withdraw')}: {currentWalletBalance.toLocaleString()} {selectedToken}</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={amount} 
              disabled={!!processingState}
              onChange={e => {
                setAmount(e.target.value);
                setHasError(false);
              }}
              placeholder={t.amount} 
              className={`w-full bg-transparent border rounded p-2.5 pr-16 text-sm font-mono outline-none dark:text-white transition-all ${hasError ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'border-gray-200 dark:border-slate-700'} ${processingState ? 'opacity-50' : ''}`} 
            />
            <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">{selectedToken}</span>
          </div>
          <div className={`pt-2 ${processingState ? 'pointer-events-none opacity-50' : ''}`}><CustomSlider value={val} onChange={handleSlider} theme={theme} /></div>
        </div>

        {/* Slippage & Estimation */}
        {type === 'deposit' ? (
           <div className="space-y-3">
             {isQuickSwap && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center space-x-1">
                      <Settings size={10} />
                      <span>{t.slippage}</span>
                    </span>
                    <span className="text-[11px] font-bold text-brand-500">{slippage}%</span>
                  </div>
                  <div className="flex space-x-2">
                    {[0.1, 0.5, 1.0].map(v => (
                      <button 
                        key={v}
                        onClick={() => { setSlippage(v); setCustomSlippage(''); }}
                        className={`flex-1 py-1 text-[11px] font-bold rounded border transition-all ${slippage === v && !customSlippage ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'border-gray-200 dark:border-slate-700 text-gray-500'}`}
                      >
                        {v}%
                      </button>
                    ))}
                    <div className="flex-[1.5] relative">
                      <input 
                        type="number"
                        value={customSlippage}
                        onChange={e => {
                           setCustomSlippage(e.target.value);
                           setSlippage(parseFloat(e.target.value) || 0.5);
                        }}
                        placeholder={t.custom}
                        className={`w-full py-1 px-2 text-[11px] font-bold rounded border bg-transparent outline-none transition-all ${customSlippage ? 'border-brand-500 text-brand-500' : 'border-gray-200 dark:border-slate-700 text-gray-500 placeholder:text-gray-600'}`}
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-gray-500">%</span>
                    </div>
                  </div>
                </div>
             )}

             <p className="text-[10px] text-gray-500 leading-tight px-1">
               {isQuickSwap ? (lang === 'en' ? 'Quick Swap uses aggregators to convert your deposit to USDC. Slippage protects you from unexpected price movements.' : '闪兑功能将通过聚合器自动将您的充值转换为 USDC。滑点设置可防止因价格剧烈波动导致交易失败。') : t.depositTips}
             </p>

             {isQuickSwap && numAmount > 0 && (
                <div className="flex justify-between items-center bg-brand-500/5 p-2 rounded border border-brand-500/20">
                  <span className="text-[11px] font-bold text-gray-500">{lang === 'en' ? 'Est. Received' : '预估到账'}</span>
                  <span className="font-mono text-xs font-bold text-brand-500">
                    ≈ {actualReceivedUSDC.toFixed(2)} USDC
                  </span>
                </div>
             )}
           </div>
        ) : (
           <div className="space-y-1 pt-1 px-1">
              <div className="flex justify-between text-xs text-gray-500"><span>{t.withdrawFee}</span><span className="text-red-400">0.5 USDC</span></div>
              <div className="flex justify-between text-xs text-gray-500 font-bold"><span>{t.actualAmount}</span><span className="text-green-500 font-mono">{actualAmount.toFixed(2)} USDC</span></div>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
           <button onClick={onClose} disabled={!!processingState} className={`py-2.5 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded transition-all ${processingState ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.cancel}</button>
           <button 
            onClick={handleAction} 
            disabled={!!processingState}
            className={`py-2.5 text-white font-bold rounded shadow-xl transition-all flex items-center justify-center space-x-2 ${isQuickSwap ? 'bg-brand-500 hover:bg-brand-600' : 'bg-[#8B5E14] hover:bg-[#7a5212]'} ${processingState ? 'opacity-80' : ''}`}
           >
             {processingState && <Loader2 size={16} className="animate-spin" />}
             <span>{getButtonText()}</span>
           </button>
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
