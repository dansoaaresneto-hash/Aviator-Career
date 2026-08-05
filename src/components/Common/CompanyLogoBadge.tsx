import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoBadgeProps {
  logoUrl?: string;
  logoColor?: string;
  icaoCode?: string;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CompanyLogoBadge: React.FC<CompanyLogoBadgeProps> = ({
  logoUrl,
  logoColor = 'from-sky-500 to-indigo-600',
  icaoCode,
  companyName,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Define size classes matching rectangular aspect ratios (approx 2.5:1 to 3:1)
  const sizeStyles = {
    sm: {
      container: 'w-16 h-7 rounded-md text-[10px]',
      padding: 'p-1',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'w-24 h-9 rounded-lg text-xs',
      padding: 'p-1.5',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      container: 'w-32 h-11 rounded-xl text-xs',
      padding: 'p-2',
      icon: 'w-4 h-4',
    },
    xl: {
      container: 'w-44 h-16 rounded-xl text-sm',
      padding: 'p-2.5',
      icon: 'w-5 h-5',
    },
  }[size];

  const hasImage = logoUrl && !imageError;

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-hidden transition-all shadow-xs border ${
        hasImage
          ? 'bg-slate-900/90 border-slate-700/70'
          : `bg-gradient-to-r ${logoColor} border-white/20 text-white`
      } ${sizeStyles.container} ${className}`}
      title={companyName || icaoCode || 'Logotipo da Empresa'}
    >
      {hasImage ? (
        <img
          src={logoUrl}
          alt={companyName || icaoCode || 'Logo'}
          onError={() => setImageError(true)}
          className={`w-full h-full object-contain ${sizeStyles.padding}`}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 px-2 font-black tracking-wider text-white">
          <Building2 className={`${sizeStyles.icon} opacity-80 shrink-0`} />
          <span className="font-mono uppercase font-extrabold truncate">
            {icaoCode || (companyName ? companyName.substring(0, 3).toUpperCase() : 'AIR')}
          </span>
        </div>
      )}
    </div>
  );
};
