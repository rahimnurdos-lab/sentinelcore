import React from 'react';
import Icon from './Icon';
import { quickActions, type QuickAction } from '../data/mockData';

interface QuickActionsProps {
  readonly onAction?: (id: string) => void;
  readonly className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAction,
  className = '',
}) => {
  const renderAction = (action: QuickAction) => {
    if (action.fullWidth) {
      return (
        <button
          key={action.id}
          onClick={() => onAction?.(action.id)}
          className="col-span-2 flex items-center justify-between p-5 rounded-full bg-surface-container-high hover:bg-surface-bright transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name={action.icon} className="text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-headline font-bold text-primary">{action.title}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                {action.subtitle}
              </p>
            </div>
          </div>
          <Icon
            name="chevron_right"
            className="text-outline group-hover:translate-x-1 transition-transform"
          />
        </button>
      );
    }

    const borderClass = action.variant === 'secondary' ? 'border-l-2 border-secondary/40' : '';

    return (
      <button
        key={action.id}
        onClick={() => onAction?.(action.id)}
        className={`flex flex-col gap-3 p-5 rounded-full bg-surface-container-high hover:bg-surface-bright transition-all active:scale-95 text-left ${borderClass}`}
      >
        <Icon
          name={action.icon}
          className={action.variant === 'secondary' ? 'text-secondary' : 'text-primary'}
        />
        <div>
          <h3 className="font-headline font-bold text-on-surface text-sm">{action.title}</h3>
          <p className="text-[10px] text-on-surface-variant">{action.subtitle}</p>
        </div>
      </button>
    );
  };

  return (
    <section className={`grid grid-cols-2 gap-4 ${className}`}>
      {quickActions.map(renderAction)}
    </section>
  );
};

export default QuickActions;
