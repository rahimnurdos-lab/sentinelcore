import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
};

export default Icon;
