import React from 'react';
import Icon from './Icon';
import { vibeCheckItems, type VibeCheckItem } from '../data/mockData';

interface VibeCheckProps {
  readonly onItemAction?: (id: string) => void;
  readonly className?: string;
}

const statusColors = {
  safe: 'bg-secondary/10 text-secondary',
  warning: 'bg-tertiary/10 text-tertiary',
  info: 'bg-primary/10 text-primary',
};

export const VibeCheck: React.FC<VibeCheckProps> = ({
  onItemAction,
  className = '',
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Күйді тексеру
          </h2>
          <p className="text-xs text-on-surface-variant">
            ЖИ-мен басқарылатын құпиялылық диагностикасы
          </p>
        </div>
        <Icon name="auto_awesome" filled className="text-secondary text-sm" />
      </div>

      {/* Items */}
      <div className="space-y-3">
        {vibeCheckItems.map((item: VibeCheckItem) => (
          <div
            key={item.id}
            className="bg-surface-container-high rounded-full p-1 pl-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {item.iconType === 'double' ? (
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-high bg-surface-variant flex items-center justify-center">
                    <Icon name={item.icon} className="text-xs" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-high bg-surface-variant flex items-center justify-center">
                    <Icon name={item.secondIcon || ''} className="text-xs" />
                  </div>
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[item.status]}`}>
                  <Icon name={item.icon} className="text-sm" />
                </div>
              )}
              <span className="text-sm font-medium text-on-surface">{item.title}</span>
            </div>
            <button
              onClick={() => onItemAction?.(item.id)}
              className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Icon name="rule" className="text-primary text-sm" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VibeCheck;
