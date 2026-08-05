import React, { useRef } from 'react';
import { AdminCompany } from '../../types';
import { CompanyLogoBadge } from '../Common/CompanyLogoBadge';
import { Building2, Upload, Link as LinkIcon, Award, Image as ImageIcon, Sparkles, Info } from 'lucide-react';

interface Props {
  formData: Partial<AdminCompany>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<AdminCompany>>>;
}

const COLOR_PRESETS = [
  { label: 'Laranja Aero', value: 'from-amber-500 to-orange-600' },
  { label: 'Azul Executivo', value: 'from-blue-600 to-indigo-700' },
  { label: 'Verde Translado', value: 'from-emerald-500 to-teal-700' },
  { label: 'Roxo Horizon', value: 'from-purple-600 to-pink-600' },
  { label: 'Ciano Coastal', value: 'from-sky-500 to-cyan-600' },
  { label: 'Vermelho Express', value: 'from-red-500 to-rose-700' },
  { label: 'Dourado VIP', value: 'from-yellow-500 to-amber-700' },
];

export const CompanyBasicInfoTab: React.FC<Props> = ({ formData, setFormData }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor escolha uma imagem menor que 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Description */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600">
        <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-600" />
          Identificação da Empresa Fictícia
        </h4>
        <p>
          Configure os dados básicos da empresa contratante. Essas informações serão exibidas nos dossiês de voo, cartões de missão e diário de bordo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Company Name */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nome da Empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Latam Virtual, AeroExpress, SkyWays"
            value={formData.name || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
          />
        </div>

        {/* Fictitious ICAO */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Código ICAO Fictício <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={4}
            placeholder="Ex: AZU, GLO, AEX"
            value={formData.icaoCode || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, icaoCode: e.target.value.toUpperCase() }))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Descrição & Tagline da Empresa
        </label>
        <textarea
          rows={2}
          placeholder="Descreva as operações, especialidades e o posicionamento de mercado da empresa..."
          value={formData.description || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
        />
      </div>

      {/* Logo Section: Upload or URL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Logotipo da Empresa (Upload ou URL)
          </label>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Formatos Retangulares & Horizontais (ex: 2.5:1 ou 3:1)
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center text-center">
              <CompanyLogoBadge
                logoUrl={formData.logoUrl}
                logoColor={formData.logoColor}
                icaoCode={formData.icaoCode}
                companyName={formData.name}
                size="xl"
              />
              <span className="text-[10px] font-bold text-slate-500 mt-2">
                Preview Retangular do Logotipo
              </span>
            </div>

            {/* Upload and URL controls */}
            <div className="sm:col-span-2 space-y-3">
              {/* Direct Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-600" />
                  <span>Fazer Upload de Logotipo Retangular</span>
                </button>
              </div>

              {/* URL Input */}
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Ou insira a URL da imagem (https://...)"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
                />
              </div>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, logoUrl: undefined }))}
                  className="text-[11px] text-red-600 hover:underline font-semibold"
                >
                  Remover imagem customizada
                </button>
              )}
            </div>
          </div>

          {/* Dimension Guidelines Note */}
          <div className="flex items-start gap-2 bg-sky-50/70 border border-sky-200/60 rounded-lg p-2.5 text-[11px] text-sky-900">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Dica de Formato:</strong> Logotipos com proporção horizontal (como <strong>300×120px</strong> ou <strong>400×150px</strong>, formato PNG/SVG transparente) adaptam-se perfeitamente aos cartões de voo sem cortes ou distorções.
            </div>
          </div>
        </div>
      </div>

      {/* Color Theme Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Estilo Visual & Gradiente da Marca
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = formData.logoColor === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, logoColor: preset.value }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${preset.value}`} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Pilot Level Slider */}
      <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-sky-600" />
            Nível Mínimo do Piloto Requerido
          </label>
          <span className="bg-sky-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-sm">
            Nível {formData.minPilotLevel || 1}
          </span>
        </div>

        <p className="text-[11px] text-sky-800">
          Pilotos com nível inferior ao selecionado não poderão aceitar missões desta empresa.
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500">Nível 1</span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={formData.minPilotLevel || 1}
            onChange={(e) => setFormData((prev) => ({ ...prev, minPilotLevel: Number(e.target.value) }))}
            className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <span className="text-xs font-bold text-slate-500">Nível 20</span>
        </div>
      </div>
    </div>
  );
};
