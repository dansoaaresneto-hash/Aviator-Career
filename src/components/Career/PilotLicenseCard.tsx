import React from 'react';
import { PilotProfile } from '../../types';
import { PilotLicenseTier } from '../../types/license';
import { ShieldCheck, Award, Plane, CheckCircle, Calendar, Hash, Globe2 } from 'lucide-react';

interface PilotLicenseCardProps {
  profile: PilotProfile;
  license: PilotLicenseTier;
}

export const PilotLicenseCard: React.FC<PilotLicenseCardProps> = ({ profile, license }) => {
  const licenseNumber = `CIV-${(100000 + (profile.level * 1420) + profile.completedFlights * 7).toString()}`;
  const issueDate = profile.licenseIssuedAt
    ? new Date(profile.licenseIssuedAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-6 sm:p-7 text-white border border-slate-700 shadow-xl relative overflow-hidden">
      {/* Background aeronautical watermark & texture */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10">
        <Plane className="w-80 h-80 text-white" />
      </div>

      {/* Top Header: Authority & Certificate Type */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe2 className="w-3 h-3 text-amber-400" />
              Certificado de Habilitação Técnica (CHT)
            </div>
            <h3 className="text-lg font-black text-white tracking-wide">
              {license.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-mono">
          <Hash className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-300 font-bold">Nº REGISTRO:</span>
          <span className="text-sky-400 font-extrabold">{licenseNumber}</span>
        </div>
      </div>

      {/* Pilot Profile & Credentials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        {/* Pilot Photo & Main Info */}
        <div className="flex items-center gap-4 sm:col-span-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 border-2 border-amber-400/60 p-0.5 overflow-hidden shadow-lg shrink-0">
            <img
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
              alt={profile.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Piloto em Comando
            </div>
            <div className="text-xl font-black text-white tracking-tight">
              {profile.name}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 pt-0.5">
              <span>Callsign: <strong className="text-amber-400 font-mono">{profile.preferredCallsign}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Nível de Carreira: <strong className="text-sky-400">{profile.level}</strong></span>
            </div>
          </div>
        </div>

        {/* License Badges & Issue Info */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Grau / Classe:</span>
            <span className="font-extrabold text-amber-300 font-mono px-2 py-0.5 bg-amber-500/20 rounded border border-amber-400/30">
              CLASSE {license.code}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Horas Voadas:</span>
            <span className="font-extrabold text-white">{profile.totalFlightHours}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Emissão:</span>
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {issueDate}
            </span>
          </div>
        </div>
      </div>

      {/* Authorized Aircraft Categories Pill Bar */}
      <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">Categorias Homologadas:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {license.allowedCategories.map((cat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md bg-sky-950/80 text-sky-300 border border-sky-600/40 text-[11px] font-bold"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
