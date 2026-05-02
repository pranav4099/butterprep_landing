import React from 'react';
import logoImage from '@/assets/butterprep-logo-new.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-80',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <img 
        src={logoImage} 
        alt="ButterPrep - Smooth Grading and Learning" 
        className={cn(sizeClasses[size], 'w-auto object-contain')}
      />
    </div>
  );
};

export default Logo;
