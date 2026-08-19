import React from 'react';
import { MissionType, UrgencyLevel } from '../../types';
import { Package, Users, Plane, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MissionBadgeProps {
  type: MissionType;
  isInternational?: boolean;
  showIcon?: boolean;
}

export const MissionBadge: React.FC<MissionBadgeProps> = ({
  type,
  isInternational = false,
  showIcon = true,
}) => {
  switch (type) {
    case 'cargo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          {showIcon && <Package className="w-3.5 h-3.5 text-amber-600" />}
          Transporte de Cargas
        </span>
      );
    case 'passenger':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
          {showIcon && <Users className="w-3.5 h-3.5 text-sky-600" />}
          {isInternational ? 'Executivo Internacional' : 'Passageiros'}
        </span>
      );
    case 'ferry':
      if (isInternational) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            {showIcon && <Globe className="w-3.5 h-3.5 text-sky-600" />}
            Translado Internacional
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          {showIcon && <Plane className="w-3.5 h-3.5 text-emerald-600" />}
          Translado Nacional
        </span>
      );
    default:
      return null;
  }
};

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  switch (urgency) {
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          Urgente
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
          <Clock className="w-3 h-3 text-orange-500" />
          Prioridade Alta
        </span>
      );
    case 'normal':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <CheckCircle className="w-3 h-3 text-slate-400" />
          Prazo Normal
        </span>
      );
  }
};
