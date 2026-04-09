import React from 'react';
import Icon from './Icon';
import type { SecurityStatus } from '../data/mockData';

interface StatusRingProps {
  readonly status: SecurityStatus;
  readonly onAction?: () => void;
  readonly className?: string;
}

const statusColors = {
  safe: {
    ring: 'border-secondary',
    bg: 'border-secondary/30',
    text: 'text-secondary',
    button: 'from-secondary to-secondary-container',
    buttonText: 'text-on-secondary',
  },
  caution: {
    ring: 'border-tertiary',
    bg: 'border-tertiary/30',
    text: 'text-tertiary',
    button: 'from-tertiary to-tertiary-container',
    buttonText: 'text-on-tertiary-fixed',
  },
  danger: {
    ring: 'border-error',
    bg: 'border-error/30',
    text: 'text-error',
    button: 'from-error to-error-container',
    buttonText: 'text-on-error',
  },
};

export const StatusRing: React.FC<StatusRingProps> = ({
  status,
  onAction,
  className = '',
}) => {
  const colors = statusColors[status.status];

  return (
    <section className={`relative ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        {/* Status Ring */}
        <div className="relative flex items-center justify-center">
          <div className={`absolute w-64 h-64 rounded-full border-2 ${colors.ring}/10`} />
          <div className={`absolute w-56 h-56 rounded-full border-2 ${colors.ring}/20 pulse-ring ${colors.text}`} />
          <div className={`w-48 h-48 rounded-full bg-surface-container-high flex flex-col items-center justify-center ${colors.bg} shadow-2xl`}>
            <Icon
              name={status.icon}
              filled
              className={`${colors.text} text-5xl mb-2`}
            />
            <div className="text-center">
              <span className={`block font-headline font-bold text-3xl tracking-tight ${colors.text}`}>
                {status.title}
              </span>
              <span className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {status.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Action */}
        <div className="text-center space-y-2">
          <p className="text-on-surface-variant text-sm px-8 leading-relaxed">
            {status.description}
          </p>
          {status.actionLabel && (
            <button
              onClick={onAction}
              className={`mt-4 px-8 py-3 bg-gradient-to-br ${colors.button} ${colors.buttonText} font-bold rounded-full text-sm shadow-lg shadow-${status.status === 'caution' ? 'tertiary' : status.status === 'safe' ? 'secondary' : 'error'}/20 active:scale-95 transition-transform`}
            >
              {status.actionLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default StatusRing;
