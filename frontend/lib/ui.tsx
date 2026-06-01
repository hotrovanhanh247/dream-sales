import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtVND = (v: number): string => {
  const m = (v || 0) / 1_000_000;
  const str = m.toFixed(1).replace(/\.0$/, '');
  return `${str} tr`;
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900',
        className
      )}
      {...props}
    />
  )
);

type CommitInputProps = {
  value: string | number;
  onCommit: (raw: string) => void;
  asNumber?: boolean;
  className?: string;
  placeholder?: string;
  step?: string;
  type?: string;
};

export const formatNumberDisplay = (v: string | number): string => {
  const n = Number(typeof v === 'string' ? v.replace(/,/g, '') : v);
  if (!isFinite(n)) return '';
  return n.toLocaleString('en-US');
};

export const parseNumberInput = (s: string): number => {
  const n = Number(s.replace(/,/g, ''));
  return isFinite(n) ? n : 0;
};

export const CommitInput = ({ value, onCommit, asNumber, className, placeholder, step, type }: CommitInputProps) => {
  const displayFor = (v: string | number): string => {
    if (v === undefined || v === null || v === '') return asNumber ? '0' : '';
    return asNumber ? formatNumberDisplay(v) : String(v);
  };
  const [local, setLocal] = React.useState<string>(displayFor(value));
  const ref = React.useRef<HTMLInputElement>(null);
  const composingRef = React.useRef(false);
  React.useEffect(() => {
    if (document.activeElement !== ref.current && !composingRef.current) {
      setLocal(displayFor(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, asNumber]);
  const commit = () => {
    if (asNumber) {
      const num = parseNumberInput(local);
      const cur = Number(typeof value === 'string' ? value.replace(/,/g, '') : value) || 0;
      if (num !== cur) onCommit(String(num));
      setLocal(formatNumberDisplay(num));
    } else {
      const cur = value === undefined || value === null ? '' : String(value);
      if (local !== cur) onCommit(local);
    }
  };
  return (
    <Input
      ref={ref}
      type={type || (asNumber ? 'text' : 'text')}
      inputMode={asNumber ? 'decimal' : undefined}
      step={step}
      placeholder={placeholder}
      className={className}
      value={local}
      onChange={e => {
        let v = e.target.value;
        if (asNumber) v = v.replace(/[^0-9.,-]/g, '');
        setLocal(v);
      }}
      onCompositionStart={() => { composingRef.current = true; }}
      onCompositionEnd={() => { composingRef.current = false; }}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
    />
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...rest }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden', className)} {...rest}>
    {children}
  </div>
);
