import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoBadgeProps {
  logoUrl?: string;
  logoColor?: string;
  icaoCode?: string;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  objectFit?: 'contain' | 'cover';
}

export const CompanyLogoBadge: React.FC<CompanyLogoBadgeProps> = ({
  logoUrl,
  logoColor = 'from-sky-500 to-indigo-600',
  icaoCode,
  companyName,
  size = 'md',
  className = '',
  objectFit = 'contain',
}) => {
  const [imageError, setImageError] = useState(false);

  // Define size classes with rectangular aspect ratio. For images, no border or padding is applied.
  const sizeStyles = {
    sm: {
      container: 'w-20 h-8 text-[10px]',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      container: 'w-28 h-10 text-xs',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'w-36 h-12 text-xs',
      icon: 'w-4 h-4',
    },
    xl: {
      container: 'w-48 h-16 text-sm',
      icon: 'w-5 h-5',
    },
  }[size];

  const hasImage = logoUrl && !imageError;

  return (
    <div
      className={`relative shrink-0 flex items-center justify-start overflow-hidden transition-all ${
        hasImage
          ? 'bg-transparent border-0 shadow-none'
          : `bg-gradient-to-r ${logoColor} rounded-lg shadow-2xs text-white justify-center`
      } ${sizeStyles.container} ${className}`}
      title={companyName || icaoCode || 'Logotipo da Empresa'}
    >
      {hasImage ? (
        <img
          src={logoUrl}
          alt={companyName || icaoCode || 'Logo'}
          onError={() => setImageError(true)}
          className={`w-full h-full ${
            objectFit === 'cover' ? 'object-cover' : 'object-contain object-center'
          } p-0`}
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

