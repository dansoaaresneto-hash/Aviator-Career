import React from 'react';
import { AdminCompany, CompanyMissionType, MISSION_TYPE_LABELS } from '../../types';
import { PlaneTakeoff, Globe, Users, Plane, Box, Check, HelpCircle } from 'lucide-react';

interface Props {
  formData: Partial<AdminCompany>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<AdminCompany>>>;
}

const MISSION_OPTIONS: { type: CompanyMissionType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    type: 'ferry_national',
    label: 'Traslado Nacional',
    icon: <PlaneTakeoff className="w-5 h-5 text-emerald-600" />,
    desc: 'Entrega técnica e reposicionamento de aeronaves privadas entre aeródromos do mesmo país.',
  },
  {
    type: 'ferry_international',
    label: 'Traslado Internacional',
    icon: <Globe className="w-5 h-5 text-indigo-600" />,
    desc: 'Ferry flight internacional transatlântico com desembaraço alfandegário, Port of Entry e emissão de dossiê de importação.',
  },
  {
    type: 'pax_regional',
    label: 'Passageiros Comercial Regional',
    icon: <Users className="w-5 h-5 text-sky-600" />,
    desc: 'Fretamento executivo, viagens corporativas e voos de curta/média distância para turismo e transporte regional.',
  },
  {
    type: 'pax_international',
    label: 'Passageiros Comercial Internacional',
    icon: <Plane className="w-5 h-5 text-purple-600" />,
    desc: 'Rotas internacionais de passageiros VIP em jatos executivos ou bimotores turboélice de alto rendimento.',
  },
  {
    type: 'cargo',
    label: 'Transporte de Cargas',
    icon: <Box className="w-5 h-5 text-amber-600" />,
    desc: 'Frete aéreo de insumos de saúde, e-commerce, maquinário industrial e encomendas de alta urgência.',
  },
];

export const CompanyMissionTypesTab: React.FC<Props> = ({ formData, setFormData }) => {
  const selectedTypes = formData.allowedMissionTypes || [];

  const toggleType = (type: CompanyMissionType) => {
    setFormData((prev) => {
      const current = prev.allowedMissionTypes || [];
      if (current.includes(type)) {
        return { ...prev, allowedMissionTypes: current.filter((t) => t !== type) };
      } else {
        return { ...prev, allowedMissionTypes: [...current, type] };
      }
    });
  };

  const selectAll = () => {
    setFormData((prev) => ({
      ...prev,
      allowedMissionTypes: MISSION_OPTIONS.map((m) => m.type),
    }));
  };

  const clearAll = () => {
    setFormData((prev) => ({
      ...prev,
      allowedMissionTypes: [],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Header instructions */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            Tipos de Missão Habilitados
          </h4>
          <p>
            Selecione quais tipos de contrato esta empresa disponibilizará no mercado de voos. O gerador automático criará missões ativas baseadas nas seleções abaixo.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={selectAll}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 cursor-pointer"
          >
            Marcar Todos
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200 cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Checkboxes List */}
      <div className="space-y-3">
        {MISSION_OPTIONS.map((option) => {
          const isChecked = selectedTypes.includes(option.type);
          return (
            <div
              key={option.type}
              onClick={() => toggleType(option.type)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                isChecked
                  ? 'bg-sky-50/50 border-sky-400/80 shadow-sm ring-1 ring-sky-400/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Checkbox Box */}
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                  isChecked
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-white border-slate-300'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              {/* Icon */}
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shrink-0 shadow-xs">
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                    {option.label}
                  </h5>
                  {isChecked && (
                    <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {option.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTypes.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
          ⚠️ Selecione ao menos um tipo de missão para que a empresa possa gerar contratos ativos no aplicativo.
        </div>
      )}
    </div>
  );
};
