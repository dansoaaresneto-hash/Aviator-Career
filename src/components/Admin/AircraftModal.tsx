import React, { useState, useEffect } from 'react';
import { AircraftModel } from '../../types';
import {
  X,
  Plane,
  Save,
  Fuel,
  Users,
  Weight,
  Package,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Gauge,
  Navigation,
  Coins,
} from 'lucide-react';

interface AircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (aircraft: AircraftModel) => void;
  editingAircraft: AircraftModel | null;
}

const CATEGORY_OPTIONS = [
  'Monomotor a Pistão',
  'Bimotor a Pistão',
  'Monomotor Turboélice',
  'Bimotor Turboélice',
  'Jato Executivo',
  'Comercial / Airliner',
  'Helicóptero',
  'Anfíbio / Utilitário',
];

export const AircraftModal: React.FC<AircraftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAircraft,
}) => {
  const [formData, setFormData] = useState<Partial<AircraftModel>>({
    name: '',
    manufacturer: '',
    icaoCode: '',
    category: 'Monomotor a Pistão',
    maxFuelGallons: 50,
    passengerCapacity: 3,
    oewKg: 800,
    mtowKg: 1200,
    maxPayloadKg: 400,
    imageUrl: '',
    cruisingSpeedKts: 130,
    rangeNm: 650,
    rentalFeePerFlight: 0,
    purchasePrice: 50000,
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAircraft) {
      setFormData(editingAircraft);
    } else {
      setFormData({
        name: '',
        manufacturer: '',
        icaoCode: '',
        category: 'Monomotor a Pistão',
        maxFuelGallons: 56,
        passengerCapacity: 3,
        oewKg: 767,
        mtowKg: 1157,
        maxPayloadKg: 390,
        imageUrl: '',
        cruisingSpeedKts: 122,
        rangeNm: 640,
        rentalFeePerFlight: 0,
        purchasePrice: 45000,
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [editingAircraft, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errs.name = 'O modelo/nome da aeronave é obrigatório.';
    }
    if (!formData.manufacturer?.trim()) {
      errs.manufacturer = 'O fabricante é obrigatório.';
    }
    if (!formData.icaoCode?.trim()) {
      errs.icaoCode = 'O código ICAO é obrigatório (ex: C172, B350).';
    }
    if (!formData.category?.trim()) {
      errs.category = 'Selecione uma categoria/tipo.';
    }
    if (formData.maxFuelGallons === undefined || formData.maxFuelGallons < 0) {
      errs.maxFuelGallons = 'Informe a capacidade máxima de combustível.';
    }
    if (formData.passengerCapacity === undefined || formData.passengerCapacity < 0) {
      errs.passengerCapacity = 'Informe a quantidade de passageiros (sem o piloto).';
    }
    if (formData.oewKg === undefined || formData.oewKg <= 0) {
      errs.oewKg = 'Informe o Peso Vazio (OEW) em kg.';
    }
    if (formData.mtowKg === undefined || formData.mtowKg <= 0) {
      errs.mtowKg = 'Informe o Peso Máximo de Decolagem (MTOW) em kg.';
    }
    if (formData.maxPayloadKg === undefined || formData.maxPayloadKg < 0) {
      errs.maxPayloadKg = 'Informe a Carga Útil Máxima em kg.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const aircraftToSave: AircraftModel = {
      id: editingAircraft ? editingAircraft.id : `ac-${Date.now()}`,
      name: formData.name?.trim() || 'Aeronave Sem Nome',
      manufacturer: formData.manufacturer?.trim() || 'Desconhecido',
      icaoCode: (formData.icaoCode?.trim() || 'ACFT').toUpperCase(),
      category: formData.category || 'Monomotor a Pistão',
      maxFuelGallons: Number(formData.maxFuelGallons) || 0,
      passengerCapacity: Number(formData.passengerCapacity) || 0,
      oewKg: Number(formData.oewKg) || 0,
      mtowKg: Number(formData.mtowKg) || 0,
      maxPayloadKg: Number(formData.maxPayloadKg) || 0,
      imageUrl: formData.imageUrl?.trim() || undefined,
      cruisingSpeedKts: Number(formData.cruisingSpeedKts) || 120,
      rangeNm: Number(formData.rangeNm) || 600,
      cargoCapacityKg: Number(formData.maxPayloadKg) || 400,
      rentalFeePerFlight: Number(formData.rentalFeePerFlight) || 0,
      purchasePrice: Number(formData.purchasePrice) || 50000,
      description: formData.description?.trim() || '',
      isActive: formData.isActive !== false,
      createdAt: editingAircraft ? editingAircraft.createdAt : new Date().toISOString(),
    };

    onSave(aircraftToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {editingAircraft ? 'Editar Aeronave' : 'Cadastrar Nova Aeronave'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados técnicos e operacionais do modelo de avião
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-500" /> Identificação Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Modelo / Nome */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modelo / Nome da Aeronave <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cessna 172 Skyhawk, King Air 350i"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-500/20'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
              </div>

              {/* Fabricante */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fabricante <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cessna, Beechcraft"
                  value={formData.manufacturer || ''}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.manufacturer ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-500/20'
                  }`}
                />
                {errors.manufacturer && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.manufacturer}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código ICAO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código ICAO <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: C172, BE58, B350, C208, A20N"
                  value={formData.icaoCode || ''}
                  onChange={(e) => setFormData({ ...formData, icaoCode: e.target.value.toUpperCase() })}
                  className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.icaoCode ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-500/20'
                  }`}
                />
                {errors.icaoCode && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.icaoCode}</p>}
              </div>

              {/* Categoria / Tipo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria / Tipo <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category || 'Monomotor a Pistão'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specs Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Weight className="w-4 h-4 text-indigo-500" /> Pesos & Capacidades
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Capacidade de Combustível */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  Combustível Máx (Galões) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 56"
                  value={formData.maxFuelGallons ?? ''}
                  onChange={(e) => setFormData({ ...formData, maxFuelGallons: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                />
              </div>

              {/* Quantidade de Passageiros */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  Qtd Passageiros (sem piloto) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 3"
                  value={formData.passengerCapacity ?? ''}
                  onChange={(e) => setFormData({ ...formData, passengerCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                />
              </div>

              {/* Carga Útil Máxima (Max Payload) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-sky-500" />
                  Carga Útil Máx (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 390"
                  value={formData.maxPayloadKg ?? ''}
                  onChange={(e) => setFormData({ ...formData, maxPayloadKg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso Vazio OEW */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Vazio (OEW em kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 767"
                  value={formData.oewKg ?? ''}
                  onChange={(e) => setFormData({ ...formData, oewKg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Operating Empty Weight (sem combustível nem carga)</span>
              </div>

              {/* Peso Máximo de Decolagem MTOW */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Máximo Decolagem (MTOW em kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 1157"
                  value={formData.mtowKg ?? ''}
                  onChange={(e) => setFormData({ ...formData, mtowKg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Maximum Takeoff Weight</span>
              </div>
            </div>
          </div>

          {/* Performance & Commercial Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" /> Desempenho & Valores do Jogo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Velocidade de Cruzeiro */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-500" />
                  Cruzeiro (kts)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 122"
                  value={formData.cruisingSpeedKts ?? ''}
                  onChange={(e) => setFormData({ ...formData, cruisingSpeedKts: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Alcance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                  Alcance (NM)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 640"
                  value={formData.rangeNm ?? ''}
                  onChange={(e) => setFormData({ ...formData, rangeNm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Taxa de Aluguel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Aluguel (CR/voo)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 0 para grátis"
                  value={formData.rentalFeePerFlight ?? ''}
                  onChange={(e) => setFormData({ ...formData, rentalFeePerFlight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Preço de Compra */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  Preço Compra (CR)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 45000"
                  value={formData.purchasePrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>

          {/* Image URL & Live Preview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" /> Foto / Imagem da Aeronave
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL da Foto/Imagem da Aeronave
              </label>
              <input
                type="url"
                placeholder="Ex: https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Insira o link direto para uma imagem da aeronave (Unsplash, HTTPS, JPG, PNG).
              </span>
            </div>

            {/* Live Image Preview Box */}
            {formData.imageUrl && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-28 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1 min-w-0">
                  <span className="font-bold text-slate-800 block">Pré-visualização da Imagem</span>
                  <p className="text-[11px] text-slate-500 truncate">{formData.imageUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição / Observações Técnicas
            </label>
            <textarea
              rows={3}
              placeholder="Descreva detalhes operacionais do avião..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
            />
          </div>

          {/* Active Status Switch */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Status da Aeronave no Sistema</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Aeronaves ativas ficam disponíveis para geração de missões e exibição no catálogo.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                formData.isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {formData.isActive ? (
                <>
                  <Check className="w-4 h-4" /> Ativa
                </>
              ) : (
                'Inativa'
              )}
            </button>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingAircraft ? 'Salvar Alterações' : 'Cadastrar Aeronave'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
