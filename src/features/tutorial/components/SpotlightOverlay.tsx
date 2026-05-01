'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  targetSelector: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  nextLabel?: string;
  onNext: () => void;
  onSkip: () => void;
};

type Rect = { top: number; left: number; width: number; height: number };

// ── Component ─────────────────────────────────────────────────────────────────

export function SpotlightOverlay({
  targetSelector,
  title,
  description,
  step,
  totalSteps,
  nextLabel,
  onNext,
  onSkip,
}: Props) {
  const t = useTranslations('tutorial.spotlight');
  const [rect, setRect] = useState<Rect | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    function measure() {
      const el = document.querySelector(targetSelector);
      if (!el) {
        frameRef.current = requestAnimationFrame(measure);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [targetSelector]);

  if (!rect) return null;

  const PAD = 8;
  const TOOLTIP_H = 160;
  const TOOLTIP_W = 304;
  const spotTop    = rect.top    - PAD;
  const spotLeft   = rect.left   - PAD;
  const spotWidth  = rect.width  + PAD * 2;
  const spotHeight = rect.height + PAD * 2;

  const spaceBelow = window.innerHeight - (spotTop + spotHeight);
  const tooltipBelow = spaceBelow >= TOOLTIP_H + 16;
  const tooltipTop = tooltipBelow
    ? spotTop + spotHeight + 12
    : Math.max(8, spotTop - TOOLTIP_H - 12);
  const tooltipLeft = Math.max(16, Math.min(spotLeft, window.innerWidth - TOOLTIP_W - 16));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotLeft}
              y={spotTop}
              width={spotWidth}
              height={spotHeight}
              rx={10}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      <div
        className="absolute rounded-xl ring-2 ring-amber-400 ring-offset-0 pointer-events-none"
        style={{ top: spotTop, left: spotLeft, width: spotWidth, height: spotHeight }}
      />

      <div
        className="absolute pointer-events-auto"
        style={{ left: tooltipLeft, top: tooltipTop, width: TOOLTIP_W }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-5">
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 rounded-full transition-all',
                  i + 1 === step ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200',
                ].join(' ')}
              />
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {t('skip')}
            </button>
            <button
              onClick={onNext}
              className="btn-primary btn-sm"
            >
              {nextLabel ?? t('understood')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
