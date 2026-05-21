import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { ChevronRight, ChevronLeft, X, Sparkles, Award } from 'lucide-react';

interface TourStep {
  targetId: string;
  titleZh: string;
  descZh: string;
  titleEn: string;
  descEn: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'guide-deposit-btn',
    titleZh: '第一步：安全充值担保资金',
    descZh: '欢迎来到黄金衍生品交易平台！开启首笔交易前，请点击顶部的「充值」按钮存入 USDC 担保。我们将为您提供模拟的大额额度。',
    titleEn: 'Step 1: Save Deposit Collateral',
    descEn: 'Welcome to GoldenDex! Before opening your first trade, click the "Deposit" button at top to add USDC collateral assets to your balance.',
    placement: 'bottom',
  },
  {
    targetId: 'guide-margin-mode-btn',
    titleZh: '第二步：选择合适的保证金模式',
    descZh: '「全仓」模式(Cross)下账户内所有可用资金共享，从而增强仓位韧性避免强平；「逐仓」模式(Isolated)下各个仓位的保证金相互隔离、各自承担亏损上限。建议根据风险偏好来切换选择。',
    titleEn: 'Step 2: Choose Margin Mode',
    descEn: 'Choose "Cross" mode to share active reserves and prevent liquidations, or "Isolated" mode to segregate trading capital independently for precise risk caps.',
    placement: 'bottom',
  },
  {
    targetId: 'guide-leverage-btn',
    titleZh: '第三步：调节交易杠杆乘数',
    descZh: '点击杠杆滑块按钮即可自由倍增您的购买力。请时刻谨记：放大盈利的同时，爆仓强平的亏损风险也会按相应杠杆倍数同比例放大。新手建议保守交易。',
    titleEn: 'Step 3: Adjust Trading Leverage',
    descEn: 'Click here to customize your margin leverage. While leverage magnifies buying power and yields, liquidation risks expand proportionally! Stay aware.',
    placement: 'bottom',
  },
  {
    targetId: 'guide-order-type-btn',
    titleZh: '第四步：选择委托下单类型',
    descZh: '「限价委托」在市场价格达到或超出您的目标挂单价时方会撮合；「市价委托」将以当前最快的实时优价立即成交，更适合风诡云谲的超短线和抢单。',
    titleEn: 'Step 4: Select Order Details',
    descEn: 'Limit orders wait until market quotes hit your target triggers, whereas Market orders fill instantly with outstanding books for immediate access.',
    placement: 'bottom',
  },
  {
    targetId: 'guide-order-actions',
    titleZh: '第五步：下单开仓',
    descZh: '在这里输入数量或金额。我们支持在「开仓数量」(XAU) 与「开仓金额」(USDC) 之间一键切换（让您自由根据数量或金额维度下单）。确认核对后点击「买入做多」（看涨）或「卖出做空」（看跌）开启本笔交易合约！',
    titleEn: 'Step 5: Trade Dimensions & Execution',
    descEn: 'Input trade limits. Toggle between "Order Quantity" (XAU) and "Order Amount" (USDC) to trade by asset or dollar weight. Press Buy/Long or Sell/Short to execute!',
    placement: 'left',
  },
  {
    targetId: 'guide-margin-adjust',
    titleZh: '第六步：手动增加与提取保证金',
    descZh: '对于已经开启的仓位，如果要灵活控制强平价格、调低爆仓风险，或释放多余的沉淀资金，可在下方的仓位列表里，点击所持仓位保证金一列的「+」或「-」按钮，来进行保证金的随时追加与提取。',
    titleEn: 'Step 6: Add or Extract Margin',
    descEn: 'For active isolated positions, if you want to dynamically adjust the liquidation price to manage risks or extract excessive collateral, you can click the "+" or "-" buttons under the Position Margin column to add or withdraw margin on demand.',
    placement: 'left',
  },
  {
    targetId: 'guide-close-button',
    titleZh: '第七步：快速平仓止盈锁定收益',
    descZh: '当收益到达理想高度，或市场走势产生反转时，请在下方案件点击对应的「快速平仓」，选择平仓参数，只需一秒即可结清仓位并将纯利落袋为安。恭喜您掌握核心流程！',
    titleEn: 'Step 7: Settle & Close Position',
    descEn: 'An active mock long position has been inserted in the panels below. When gains align with your goals, click "Close" on its row to settle instantly and secure USDC capital.',
    placement: 'left',
  }
];

interface NewbieGuideProps {
  lang: Language;
  onStepChange: (stepIndex: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export const NewbieGuide: React.FC<NewbieGuideProps> = ({
  lang,
  onStepChange,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [repositionedCount, setRepositionedCount] = useState(0);

  const step = TOUR_STEPS[currentStep];

  // Detect and monitor coordinates of targeted element
  useEffect(() => {
    const updateTargetCoords = () => {
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    // Scroll element smoothly into view center immediately when step triggers
    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Retry in case of tab rendering or mounting delays
      const timer = setTimeout(() => {
        const delayedElement = document.getElementById(step.targetId);
        if (delayedElement) {
          delayedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }

    updateTargetCoords();
    onStepChange(currentStep);

    // Set up brief polling in case elements appear asynchronously (e.g. state delays)
    const interval = setInterval(updateTargetCoords, 400);

    window.addEventListener('resize', updateTargetCoords);
    window.addEventListener('scroll', updateTargetCoords, { capture: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetCoords);
      window.removeEventListener('scroll', updateTargetCoords, { capture: true });
    };
  }, [currentStep, step.targetId, onStepChange]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Determine popup style near target with viewport boundaries in mind
  let bubbleStyle: React.CSSProperties = {};
  if (targetRect) {
    const bubbleWidth = 330;
    const bubbleHeight = 180;
    const gap = 12; // Gap from target border

    let top = 0;
    let left = 0;

    const placement = step.placement;

    if (placement === 'top') {
      top = targetRect.top - bubbleHeight - gap;
      left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
      
      // If Top doesn't fit on screen, fallback to bottom
      if (top < 10) {
        top = targetRect.bottom + gap;
      }
    } else if (placement === 'bottom') {
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
      
      // If Bottom doesn't fit on screen, fallback to top
      if (top + bubbleHeight > window.innerHeight - 10) {
        top = targetRect.top - bubbleHeight - gap;
      }
    } else if (placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;
      left = targetRect.left - bubbleWidth - gap;
      
      // If Left doesn't fit horizontally, fallback to right or center top
      if (left < 10) {
        left = targetRect.right + gap;
        // If Right also doesn't fit, place centered in viewport horizontally but same top
        if (left + bubbleWidth > window.innerWidth - 10) {
          left = Math.max(10, window.innerWidth - bubbleWidth - 10);
        }
      }
    } else if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;
      left = targetRect.right + gap;
      
      // If Right doesn't fit horizontally, fallback to left
      if (left + bubbleWidth > window.innerWidth - 10) {
        left = targetRect.left - bubbleWidth - gap;
        if (left < 10) {
          left = 10;
        }
      }
    }

    // Now, prevent vertical overflow by clamping, BUT never let it overlap the target vertically!
    if (placement === 'top' || placement === 'bottom') {
      if (placement === 'top') {
        if (top > targetRect.top - bubbleHeight) {
          top = targetRect.top - bubbleHeight - gap;
        }
        if (top < 10) {
          top = targetRect.bottom + gap;
        }
      } else {
        if (top < targetRect.bottom) {
          top = targetRect.bottom + gap;
        }
        if (top + bubbleHeight > window.innerHeight - 10) {
          top = targetRect.top - bubbleHeight - gap;
        }
      }
    } else {
      // 'left' or 'right' - vertical clamping is fully safe which won't overlap horizontally separated buttons
      if (top < 10) top = 10;
      if (top + bubbleHeight > window.innerHeight - 10) {
        top = window.innerHeight - bubbleHeight - 10;
      }
    }

    // Horizontal clamping (only if placement is top/bottom)
    if (placement === 'top' || placement === 'bottom') {
      if (left < 10) left = 10;
      if (left + bubbleWidth > window.innerWidth - 10) {
        left = window.innerWidth - bubbleWidth - 10;
      }
    } else {
      // Horizontal separation bounds check for left/right
      if (placement === 'left') {
        if (left + bubbleWidth > targetRect.left) {
          left = targetRect.left - bubbleWidth - gap;
        }
      } else {
        if (left < targetRect.right) {
          left = targetRect.right + gap;
        }
      }
    }

    // Final safety clamps
    if (left < 10) left = 10;
    if (left + bubbleWidth > window.innerWidth - 10) {
      left = window.innerWidth - bubbleWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + bubbleHeight > window.innerHeight - 10) {
      top = window.innerHeight - bubbleHeight - 10;
    }

    bubbleStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${bubbleWidth}px`,
    };
  } else {
    // If no target is visible/exist, place centrally as a modal
    bubbleStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '330px',
    };
  }

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none select-none">
      {/* Target Spotlight Mask */}
      <svg className="fixed inset-0 pointer-events-none w-full h-full">
        <defs>
          <mask id="newbie-spotlight-mask">
            {/* White parts are opaque (dark mask shown) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black part is cutout (transparent spotlight shown) */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Darkened layer covering screen */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(4, 7, 15, 0.65)"
          mask="url(#newbie-spotlight-mask)"
          className="pointer-events-auto"
        />
      </svg>

      {/* Interactive Tooltip Card */}
      <div
        style={bubbleStyle}
        className="pointer-events-auto bg-slate-900 border-2 border-brand-500/80 rounded-2xl p-5 shadow-2xl text-left transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-5 text-slate-200 select-text"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 text-brand-400 font-bold text-xs uppercase tracking-wide">
            {isLastStep ? <Award className="w-4.5 h-4.5 animate-bounce" /> : <Sparkles className="w-4 h-4" />}
            <span>{lang === 'en' ? 'Newbie Onboarding' : '新手操作向导'}</span>
          </div>
          <button 
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition p-1 hover:bg-slate-800 rounded"
            title={lang === 'en' ? 'Skip all' : '跳过引导'}
          >
            <X size={14} />
          </button>
        </div>

        <h4 className="text-sm font-black text-white leading-tight mb-2">
          {lang === 'en' ? step.titleEn : step.titleZh}
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed font-normal mb-4 min-h-[54px]">
          {lang === 'en' ? step.descEn : step.descZh}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          {/* Step indicator */}
          <span className="text-gray-400 font-medium">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition"
              >
                <ChevronLeft size={12} />
                <span>{lang === 'en' ? 'Back' : '上一步'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-slate-900 font-black hover:bg-brand-400 active:scale-95 transition"
            >
              <span>{isLastStep ? (lang === 'en' ? 'Complete' : '完成引导') : (lang === 'en' ? 'Next' : '下一步')}</span>
              {!isLastStep && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
