import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { Warehouse, Gauge, Navigation, Users, Package, Coins, Info, Fuel, Weight } from 'lucide-react';

export const FleetView: React.FC = () => {
  const { adminAircrafts } = usePilot();
  const activeFleet = adminAircrafts.filter((a) => a.isActive !== false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-sky-500" />
            Minha Garagem & Hangar de Aeronaves
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catálogo de modelos homologados para missões no Aviator. Alugue ou adquira aviões para sua frota.
          </p>
        </div>
      </div>

      {/* Intro info card */}
      <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs text-sky-900 leading-relaxed">
          <h4 className="font-bold text-sky-950 mb-0.5">Aluguel Inicial Gratuito</h4>
          <p className="text-sky-800/90">
            Como você iniciou sua carreira com <strong>0 Créditos</strong>, o modelo <strong>Cessna 172 Skyhawk</strong> está disponível para aluguel sem taxas nos seus primeiros contratos. Conforme acumula créditos, você poderá alugar bimotores, turboélices e jatos executivos.
          </p>
        </div>
      </div>

      {/* Aircraft Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeFleet.map((aircraft) => (
          <div
            key={aircraft.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all group"
          >
            <div>
              {/* Aircraft Photo / Header */}
              <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
                {aircraft.imageUrl ? (
                  <img
                    src={aircraft.imageUrl}
                    alt={aircraft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
                    <Warehouse className="w-10 h-10 opacity-40 text-slate-300" />
                    <span className="text-xs font-mono font-bold text-slate-400">{aircraft.icaoCode}</span>
                  </div>
                )}
                
                {/* Category Pill Over Image */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
                    {aircraft.category}
                  </span>
                </div>

                {/* ICAO Code Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-md bg-sky-500 text-white shadow-xs">
                    {aircraft.icaoCode}
                  </span>
                </div>

                {/* Rental Tag */}
                <div className="absolute bottom-3 right-3">
                  {aircraft.rentalFeePerFlight === 0 ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-emerald-500 text-white shadow-xs">
                      Aluguel Grátis
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-200 border border-white/10">
                      {aircraft.rentalFeePerFlight?.toLocaleString('pt-BR') || 0} CR / voo
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                {/* Title & Manufacturer */}
                <h3 className="text-base font-black text-slate-800 leading-snug">{aircraft.name}</h3>
                <p className="text-xs text-slate-400 font-bold mb-3">{aircraft.manufacturer}</p>

                {aircraft.description && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2 font-normal">
                    {aircraft.description}
                  </p>
                )}

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">Combustível Máx</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      {aircraft.maxFuelGallons?.toLocaleString('pt-BR')} gal
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">Passageiros</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      {aircraft.passengerCapacity} pax
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">Peso Vazio (OEW)</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5 text-slate-400" />
                      {aircraft.oewKg?.toLocaleString('pt-BR')} kg
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">Carga Útil (Payload)</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-sky-500" />
                      {aircraft.maxPayloadKg?.toLocaleString('pt-BR')} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Footer */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Preço de Compra</span>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1 mt-0.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {aircraft.purchasePrice ? `${aircraft.purchasePrice.toLocaleString('pt-BR')} CR` : 'Sob consulta'}
                </p>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                MTOW: {aircraft.mtowKg?.toLocaleString('pt-BR')} kg
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
