'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export type IconPressLinkProps = {
  href?: string;
  onActivate?: () => void;
  className?: string;
  iconSrc: string;
  iconAlt: string;
  label?: string;
  labelClassName?: string;
  delayMs?: number;
};


export default function IconPressLink({
  href,
  onActivate,
  className,
  iconSrc,
  iconAlt,
  label,
  labelClassName,
  delayMs = 220,
}: IconPressLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleActivate = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      try {
        if (onActivate) {
          onActivate();
          return;
        }
        if (href) {
          router.push(href);
        }
      } finally {
        setIsAnimating(false);
      }
    }, delayMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleActivate();
  };

  return (
    <button
      type="button"
      aria-label={label ?? iconAlt}
      className={className}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      disabled={isAnimating}
    >
      <span className="flex flex-col items-center">
        <span
          className="relative inline-block w-[min(300px,clamp(100px,24vw,250px))] max-w-full transition-transform duration-150 ease-out origin-center"
          style={{ transform: isAnimating ? 'scale(0.92)' : 'scale(1)' }}
        >
          <img 
            src={iconSrc} 
            alt={iconAlt}
            width={250}
            height={172}
            className="block w-full h-full object-contain opacity-100"
          />
        </span>
        {label ? (
          <span
            className={
              labelClassName ??
              "font-medium text-[clamp(1rem,2vw,40px)] leading-none tracking-normal text-center text-white"
            }
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        ) : null}
      </span>
    </button>
  );
}

