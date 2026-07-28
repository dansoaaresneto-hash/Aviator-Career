import React, { useState } from 'react';
import { FerryDossier, PilotProfile, ContractCompany } from '../../types';
import { FileCheck, Building2, ShieldCheck, Plane, UserCheck, Copy, Check, Lock, Stamp, Award, Download } from 'lucide-react';
import { getAviationAuthority } from '../../utils/aviationAuthority';
import { generateFerryAuthorizationPdf } from '../../utils/generateFerryAuthorizationPdf';

interface CompanyAuthorizationDocProps {
  dossier: FerryDossier;
  company: ContractCompany;
  pilot: PilotProfile;
}

export const CompanyAuthorizationDoc: React.FC<CompanyAuthorizationDocProps> = ({
  dossier,
  company,
  pilot,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const originAuth = getAviationAuthority(dossier.originCountryCode, dossier.originCountryName);
  const destAuth = getAviationAuthority(dossier.destinationCountryCode, dossier.destinationCountryName);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="bg-amber-50/40 rounded-xl border border-amber-200/90 p-5 shadow-md relative overflow-hidden space-y-4">
      {/* Official Watermark background */}
      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none text-slate-900 font-black text-7xl tracking-tighter uppercase">
        OFFICIAL DISPATCH
      </div>

      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-widest bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Documento Oficial de Autorização de Translado
            </span>
            <h4 className="text-sm font-black text-slate-900 mt-0.5">
              Carta de Procuração & Ficha Técnica de Despacho
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => generateFerryAuthorizationPdf(dossier, company, pilot)}
            className="text-xs font-black text-white bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono font-bold text-slate-500 block">Licença de Exportação Nº</span>
            <span className="text-xs font-mono font-extrabold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300 inline-block">
              {dossier.exportLicenseNo || 'EXP-2026-GLOBAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Official Text Intro */}
      <p className="text-xs text-slate-700 leading-relaxed italic bg-white/80 p-3 rounded-lg border border-amber-200/80">
        "A contratante <strong>{dossier.currentOwner}</strong> concede por meio deste documento plenos poderes de translado ao Comandante <strong>{pilot.name}</strong> para conduzir a aeronave <strong>{dossier.aircraftModel}</strong> entre <strong>{dossier.originCountryName}</strong> e <strong>{dossier.destinationCountryName}</strong>, cumprindo as exaltações legais dos órgãos {originAuth.civilAuthority} e {destAuth.civilAuthority}."
      </p>

      {/* Grid of Key Data for Easy Copy / Consultation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Section 1: Pilot & Company Details */}
        <div className="bg-white p-3.5 rounded-lg border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-extrabold text-amber-950 uppercase text-[10px] flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Dados do Piloto
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Consulta</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block">Nome do Comandante:</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">{pilot.name}</span>
                <button
                  onClick={() => handleCopy(pilot.name, 'pilotName')}
                  className="text-slate-400 hover:text-amber-700 p-0.5 cursor-pointer"
                  title="Copiar Nome"
                >
                  {copiedField === 'pilotName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Callsign / Código de Voo:</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">{pilot.preferredCallsign || 'PT-PLT'}</span>
                <button
                  onClick={() => handleCopy(pilot.preferredCallsign || 'PT-PLT', 'callsign')}
                  className="text-slate-400 hover:text-amber-700 p-0.5 cursor-pointer"
                  title="Copiar Callsign"
                >
                  {copiedField === 'callsign' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Nível de Habilitação:</span>
              <span className="font-bold text-slate-800">{pilot.title}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Owner & Contracting Details */}
        <div className="bg-white p-3.5 rounded-lg border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-extrabold text-amber-950 uppercase text-[10px] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" /> Proprietário / Contratante
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Empresa</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block">Razão Social / Nome:</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate max-w-[160px]">{dossier.currentOwner}</span>
                <button
                  onClick={() => handleCopy(dossier.currentOwner, 'owner')}
                  className="text-slate-400 hover:text-amber-700 p-0.5 cursor-pointer"
                  title="Copiar Proprietário"
                >
                  {copiedField === 'owner' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {dossier.ownerTaxId && (
              <div>
                <span className="text-[10px] text-slate-500 block">CNPJ / Tax ID do Proprietário:</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono">{dossier.ownerTaxId}</span>
                  <button
                    onClick={() => handleCopy(dossier.ownerTaxId || '', 'taxId')}
                    className="text-slate-400 hover:text-amber-700 p-0.5 cursor-pointer"
                  >
                    {copiedField === 'taxId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {dossier.insurancePolicyNo && (
              <div>
                <span className="text-[10px] text-slate-500 block">Apólice de Seguro Internacional:</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono">{dossier.insurancePolicyNo}</span>
                  <button
                    onClick={() => handleCopy(dossier.insurancePolicyNo || '', 'insurance')}
                    className="text-slate-400 hover:text-amber-700 p-0.5 cursor-pointer"
                  >
                    {copiedField === 'insurance' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Aircraft & Route Specifications */}
        <div className="bg-white p-3.5 rounded-lg border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-extrabold text-amber-950 uppercase text-[10px] flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-amber-600" /> Dados Técnicos da Aeronave
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Matrícula</span>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Matrícula Origem:</span>
                <span className="font-mono font-black text-amber-900">{dossier.originalRegistration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Nova Matrícula:</span>
                <span className="font-mono font-black text-emerald-700">{dossier.newRegistration}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Série / MSN:</span>
                <span className="font-mono font-bold text-slate-900">{dossier.msn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Port of Entry:</span>
                <span className="font-mono font-bold text-slate-900">{dossier.portOfEntryIcao}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
