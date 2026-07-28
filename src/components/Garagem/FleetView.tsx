import React from 'react';
import { AIRCRAFT_CATALOG } from '../../data/initialFleet';
import { Warehouse, Gauge, Navigation, Users, Package, Coins, CheckCircle, Info } from 'lucide-react';

export const FleetView: React.FC = () => {
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
            Como você iniciou sua carreira com <strong>0 Créditos</strong>, o modelo <strong>Cessna 172 Skyhawk</strong> está disponível para aluguel sem taxas nos seus primeiros contratos. Conforme acumula créditos, você poderá alugar bimotores e turboélices pesados.
          </p>
        </div>
      </div>

      {/* Aircraft Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AIRCRAFT_CATALOG.map((aircraft) => (
          <div
            key={aircraft.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-sky-300 transition-all"
          >
            <div>
              {/* Category Pill & Rental Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${aircraft.imagePlaceholderColor}`}>
                  {aircraft.category}
                </span>

                {aircraft.rentalFeePerFlight === 0 ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aluguel Grátis
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">
                    {aircraft.rentalFeePerFlight} CR / voo
                  </span>
                )}
              </div>

              {/* Title & Manufacturer */}
              <h3 className="text-lg font-black text-slate-800">{aircraft.name}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{aircraft.manufacturer}</p>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {aircraft.description}
              </p>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-6">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Cruzeiro</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-sky-500" />
                    {aircraft.cruisingSpeedKts} kts
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Alcance</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                    {aircraft.rangeNm} NM
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Passageiros</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    Até {aircraft.passengerCapacity} pax
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Carga Máxima</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-500" />
                    {aircraft.cargoCapacityKg} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Price Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Preço de Compra</span>
                <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {aircraft.purchasePrice.toLocaleString('pt-BR')} CR
                </p>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                Disponível no MSFS
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
