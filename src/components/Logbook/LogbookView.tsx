import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { BookOpen, Search, Coins, Zap, MapPin, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

export const LogbookView: React.FC = () => {
  const { logbook } = usePilot();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLog = logbook.filter((entry) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      entry.departureIcao.toLowerCase().includes(q) ||
      entry.arrivalIcao.toLowerCase().includes(q) ||
      entry.title.toLowerCase().includes(q) ||
      entry.aircraft.toLowerCase().includes(q)
    );
  });

  const totalCreditsEarned = logbook.reduce((sum, item) => sum + item.earnedCredits, 0);
  const totalNmFlown = logbook.reduce((sum, item) => sum + item.distanceNm, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            Diário de Bordo Oficial (Logbook)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Histórico permanente de todos os voos, relatórios de pouso e ganhos acumulados
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ICAO, missão..."
            className="w-full bg-white border border-slate-200/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Créditos Acumulados em Voos</span>
            <p className="text-xl font-extrabold text-slate-800">{totalCreditsEarned.toLocaleString('pt-BR')} CR</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Distância Total Navegada</span>
            <p className="text-xl font-extrabold text-slate-800">{totalNmFlown.toLocaleString('pt-BR')} NM</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Voos Registrados</span>
            <p className="text-xl font-extrabold text-slate-800">{logbook.length} voos</p>
          </div>
        </div>
      </div>

      {/* Logbook Table / List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
        {filteredLog.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Nenhum voo no histórico</h4>
            <p className="text-xs text-slate-400 mt-1">
              Aceite contratos e conclua seus voos para ver os registros detalhados aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLog.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                    {log.departureIcao}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{log.title}</h4>
                      {log.status === 'completed' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          Concluído ({log.landingScore}% Pouso)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Cancelado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rota: <strong className="text-slate-700">{log.departureIcao} ➔ {log.arrivalIcao}</strong> • {log.distanceNm} NM • Aeronave: {log.aircraft}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600 block">
                      +{log.earnedCredits.toLocaleString('pt-BR')} CR
                    </span>
                    <span className="text-[10px] font-bold text-sky-600">+{log.earnedXp} XP</span>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(log.completedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
