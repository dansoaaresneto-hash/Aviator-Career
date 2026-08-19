import React from 'react';
import { AdminCompany, WORLD_REGIONS, CompanyRouteRule } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { checkCountryRegulatoryStatus } from '../../utils/regulatoryEngine';
import { Globe, MapPin, Check, Compass, Sliders, AlertCircle } from 'lucide-react';

interface Props {
  formData: Partial<AdminCompany>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<AdminCompany>>>;
}

export const CompanyRouteRulesTab: React.FC<Props> = ({ formData, setFormData }) => {
  const { countriesInfo, regulatoryBodies, regulatoryZones, airportPool } = usePilot();

  const routeRules: CompanyRouteRule = formData.routeRules || {
    scope: 'national',
    selectedRegions: ['south_america'],
    originCountries: ['BR'],
    destinationCountries: ['BR'],
    minDistanceNm: 30,
    maxDistanceNm: 3000,
  };

  const updateRules = (patch: Partial<CompanyRouteRule>) => {
    setFormData((prev) => ({
      ...prev,
      routeRules: {
        ...(prev.routeRules || {
          scope: 'national',
          selectedRegions: [],
          originCountries: ['BR'],
          destinationCountries: ['BR'],
        }),
        ...patch,
      },
    }));
  };

  // Toggle all countries in a region
  const toggleRegionCountries = (regionId: string) => {
    const region = WORLD_REGIONS.find((r) => r.id === regionId);
    if (!region) return;

    const regionCountryCodes = region.countries.map((c) => c.code);

    const currentOrigins = routeRules.originCountries || [];
    const allSelected = regionCountryCodes.every((c) => currentOrigins.includes(c));

    let newOrigins: string[];
    let newDests: string[];
    let newSelectedRegions = routeRules.selectedRegions || [];

    if (allSelected) {
      // Remove all countries of this region
      newOrigins = currentOrigins.filter((c) => !regionCountryCodes.includes(c));
      newDests = (routeRules.destinationCountries || []).filter((c) => !regionCountryCodes.includes(c));
      newSelectedRegions = newSelectedRegions.filter((r) => r !== regionId);
    } else {
      // Add all countries of this region
      newOrigins = Array.from(new Set([...currentOrigins, ...regionCountryCodes]));
      newDests = Array.from(new Set([...(routeRules.destinationCountries || []), ...regionCountryCodes]));
      if (!newSelectedRegions.includes(regionId)) {
        newSelectedRegions.push(regionId);
      }
    }

    updateRules({
      selectedRegions: newSelectedRegions,
      originCountries: newOrigins,
      destinationCountries: newDests,
    });
  };

  // Toggle individual country
  const toggleCountry = (countryCode: string) => {
    const currentOrigins = routeRules.originCountries || [];
    const currentDests = routeRules.destinationCountries || [];
    const isSelected = currentOrigins.includes(countryCode);

    if (isSelected) {
      updateRules({
        originCountries: currentOrigins.filter((c) => c !== countryCode),
        destinationCountries: currentDests.filter((c) => c !== countryCode),
      });
    } else {
      updateRules({
        originCountries: [...currentOrigins, countryCode],
        destinationCountries: [...currentDests, countryCode],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-sky-600" />
          Regras de Atuação de Rotas & Cobertura Geográfica
        </h4>
        <p>
          Defina o escopo operacional e a cobertura de países de origem e destino da empresa.
        </p>
        <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Diretriz Regulatória:</strong> Para que uma rota de translado internacional seja gerada entre dois países, ambos devem possuir <strong>Zona Regulatória</strong>, <strong>Órgão Regulador</strong> e ao menos um <strong>Port of Entry (POE)</strong> cadastrados no Admin. Países não configurados serão ignorados pelo despachador automático.
          </span>
        </div>
      </div>

      {/* Scope Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Escopo Operacional da Empresa
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'national', label: 'Apenas Nacional', desc: 'Voos dentro do mesmo país' },
            { id: 'international', label: 'Internacional / Cross-Region', desc: 'Rotas entre países selecionados' },
            { id: 'global', label: 'Cobertura Global', desc: 'Qualquer rota internacional sem restrições' },
          ].map((item) => {
            const isSelected = routeRules.scope === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateRules({ scope: item.id as any })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-extrabold">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Region Selector Buttons */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Compass className="w-4 h-4 text-amber-500" />
            Atalhos por Região Continente (Seleção Automática em Bloco)
          </label>
          <span className="text-[11px] font-semibold text-slate-500">
            {routeRules.originCountries?.length || 0} países selecionados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {WORLD_REGIONS.map((region) => {
            const countryCodes = region.countries.map((c) => c.code);
            const allSelected = countryCodes.every((c) => (routeRules.originCountries || []).includes(c));
            const someSelected = countryCodes.some((c) => (routeRules.originCountries || []).includes(c));

            return (
              <button
                key={region.id}
                type="button"
                onClick={() => toggleRegionCountries(region.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  allSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : someSelected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{region.flagEmoji}</span>
                  <span className="truncate">{region.name}</span>
                </div>
                {allSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Countries Checkbox Grid */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700">
          Países Cobertos (Marque ou Desmarque Individualmente)
        </label>

        <div className="space-y-4">
          {WORLD_REGIONS.map((region) => (
            <div key={region.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-200/60">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{region.flagEmoji}</span>
                  <span>{region.name}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {region.countries.filter((c) => (routeRules.originCountries || []).includes(c.code)).length} de {region.countries.length} países
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {region.countries.map((country) => {
                  const isChecked = (routeRules.originCountries || []).includes(country.code);
                  const regStatus = checkCountryRegulatoryStatus(
                    country.code,
                    { countriesInfo, regulatoryBodies, regulatoryZones, airportPool }
                  );

                  return (
                    <div
                      key={country.code}
                      onClick={() => toggleCountry(country.code)}
                      title={
                        regStatus.isEligibleForInternationalFerry
                          ? `✓ Homologado para Translados: ${regStatus.poeCount} Port(s) of Entry ativos`
                          : `Configuração regulatória pendente: ${regStatus.missingRequirements.join(', ')}`
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-white border-sky-500 text-sky-950 font-bold shadow-2xs'
                          : 'bg-white/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                            isChecked ? 'bg-sky-600 border-sky-600 text-white font-extrabold' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600 shrink-0">
                          {country.code}
                        </span>
                        <span className="truncate">{country.name}</span>
                      </div>

                      {/* Regulatory Readiness Badge */}
                      {regStatus.isEligibleForInternationalFerry ? (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0"
                          title={`${regStatus.poeCount} Port of Entry disponível(is)`}
                        >
                          POE ({regStatus.poeCount})
                        </span>
                      ) : isChecked ? (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-800 font-medium shrink-0"
                          title="Sem POE/Órgão cadastrado - não gerará translados internacionais até ser configurado"
                        >
                          Pendente
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distance Boundaries */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-sky-600" />
          Restrições de Distância da Rota (Nautical Miles - NM)
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-600">Distância Mínima (NM)</span>
            <input
              type="number"
              min={10}
              max={1000}
              value={routeRules.minDistanceNm || 30}
              onChange={(e) => updateRules({ minDistanceNm: Number(e.target.value) })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-600">Distância Máxima (NM)</span>
            <input
              type="number"
              min={100}
              max={10000}
              value={routeRules.maxDistanceNm || 5000}
              onChange={(e) => updateRules({ maxDistanceNm: Number(e.target.value) })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
