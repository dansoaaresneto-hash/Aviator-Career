import React from 'react';
import { Contract, FerryDossier, PilotProfile } from '../../../types';
import { generateFerryAuthorizationPdf } from '../../../utils/generateFerryAuthorizationPdf';
import {
  Plane,
  FileText,
  Download,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AircraftDossierSectionProps {
  contract: Contract;
  dossier?: FerryDossier;
  profile: PilotProfile;
}

export const AircraftDossierSection: React.FC<AircraftDossierSectionProps> = ({
  contract,
  dossier,
  profile,
}) => {
  const handleDownloadPdf = () => {
    if (!dossier) return;
    generateFerryAuthorizationPdf(contract, dossier, profile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200 font-mono">
                Dossiê da Célula & Matrículas
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {dossier?.originalRegistration || 'N/A'} ➔ {dossier?.newRegistration || 'N/A'}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Certificados & Fatura Comercial (Bill of Sale)
            </h3>
          </div>
        </div>

        {dossier && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Termo em PDF</span>
          </button>
        )}
      </div>

      {/* Grid of Aircraft Specs & Commercial Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Specs Card */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Plane className="w-4 h-4 text-sky-500" />
            <h4 className="text-sm font-bold text-slate-900">Especificações Técnicas da Aeronave</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Modelo da Célula:</span>
              <strong className="text-slate-900 font-mono">
                {dossier?.aircraftModel || contract.requiredAircraft}
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Fabricante:</span>
              <strong className="text-slate-900">{dossier?.manufacturer || 'Aviation Inc.'}</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Número de Série (MSN):</span>
              <strong className="text-slate-900 font-mono">{dossier?.msn || 'MSN-84920'}</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Peso Máximo de Decolagem (MTOW):</span>
              <strong className="text-slate-900 font-mono">
                {dossier?.mtowKg ? `${dossier.mtowKg.toLocaleString('pt-BR')} kg` : '3.354 kg'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Empresa Operadora:</span>
              <strong className="text-slate-900">{contract.company.name}</strong>
            </div>
          </div>
        </div>

        {/* Commercial & Fiscal Dossier Card */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Fatura Comercial & Declaração Fiscal
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">País de Exportação (Origem):</span>
              <strong className="text-slate-900 font-mono">
                {dossier?.originCountryName || 'Estados Unidos'} ({dossier?.originCountryCode || 'US'})
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">País de Destino (Importação):</span>
              <strong className="text-slate-900 font-mono">
                {dossier?.destinationCountryName || 'Brasil'} ({dossier?.destinationCountryCode || 'BR'})
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Port of Entry (Desembaraço):</span>
              <strong className="text-slate-900 font-mono">
                {dossier?.portOfEntryIcao || 'SBSG'} — {dossier?.portOfEntryCity || 'Natal, RN'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Proprietário Comprador:</span>
              <strong className="text-slate-900">{dossier?.currentOwner || contract.company.name}</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Piloto de Translado Designado:</span>
              <strong className="text-slate-900">{profile.name} ({profile.preferredCallsign || 'PT-PLT'})</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
