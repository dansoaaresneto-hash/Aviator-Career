import React, { useState, useEffect } from 'react';
import { AdminCompany } from '../../types';
import { CompanyBasicInfoTab } from './CompanyBasicInfoTab';
import { CompanyMissionTypesTab } from './CompanyMissionTypesTab';
import { CompanyRouteRulesTab } from './CompanyRouteRulesTab';
import { X, Building2, CheckCircle2, Save, Sparkles, SlidersHorizontal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: AdminCompany) => void;
  editingCompany: AdminCompany | null;
}

export const CompanyModal: React.FC<Props> = ({ isOpen, onClose, onSave, editingCompany }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'missions' | 'routes'>('info');

  const [formData, setFormData] = useState<Partial<AdminCompany>>({
    name: '',
    icaoCode: '',
    description: '',
    logoColor: 'from-blue-600 to-indigo-700',
    minPilotLevel: 1,
    isActive: true,
    allowedMissionTypes: ['pax_regional', 'cargo'],
    routeRules: {
      scope: 'national',
      selectedRegions: ['south_america'],
      originCountries: ['BR'],
      destinationCountries: ['BR'],
      minDistanceNm: 30,
      maxDistanceNm: 2500,
    },
  });

  useEffect(() => {
    if (editingCompany) {
      setFormData(editingCompany);
    } else {
      setFormData({
        id: `comp-${Date.now()}`,
        name: '',
        icaoCode: '',
        description: '',
        logoColor: 'from-blue-600 to-indigo-700',
        minPilotLevel: 1,
        isActive: true,
        allowedMissionTypes: ['pax_regional', 'cargo'],
        routeRules: {
          scope: 'national',
          selectedRegions: ['south_america'],
          originCountries: ['BR'],
          destinationCountries: ['BR'],
          minDistanceNm: 30,
          maxDistanceNm: 2500,
        },
      });
    }
    setActiveTab('info');
  }, [editingCompany, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.icaoCode) {
      alert('Por favor preencha o Nome e o Código ICAO fictício da empresa.');
      return;
    }

    const companyToSave: AdminCompany = {
      id: formData.id || `comp-${Date.now()}`,
      name: formData.name,
      icaoCode: formData.icaoCode.toUpperCase(),
      description: formData.description || 'Empresa de aviação fictícia.',
      logoUrl: formData.logoUrl,
      logoColor: formData.logoColor || 'from-sky-500 to-indigo-600',
      minPilotLevel: formData.minPilotLevel || 1,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      allowedMissionTypes: formData.allowedMissionTypes || ['cargo'],
      routeRules: formData.routeRules || {
        scope: 'national',
        selectedRegions: ['south_america'],
        originCountries: ['BR'],
        destinationCountries: ['BR'],
      },
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    onSave(companyToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {editingCompany ? 'Editar Empresa Fictícia' : 'Cadastrar Nova Empresa (Admin)'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina as regras operacionais, logo, tipos de missão e rotas de atuação.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-sky-600 text-sky-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Dados & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'missions'
                ? 'border-sky-600 text-sky-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Tipos de Missão</span>
            {(formData.allowedMissionTypes?.length || 0) > 0 && (
              <span className="bg-sky-100 text-sky-700 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {formData.allowedMissionTypes?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'border-sky-600 text-sky-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>3. Regras de Atuação de Rotas</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            {activeTab === 'info' && (
              <CompanyBasicInfoTab formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'missions' && (
              <CompanyMissionTypesTab formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'routes' && (
              <CompanyRouteRulesTab formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-500 font-medium">
              * O sistema gerará contratos automaticamente de acordo com as regras salvas.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Empresa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
