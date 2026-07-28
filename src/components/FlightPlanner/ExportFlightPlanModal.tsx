import React, { useState } from 'react';
import { FlightPlanWaypoint } from '../../types';
import { exportMsfsPlnFile, exportGpxFile, buildIcaoRouteString } from '../../utils/flightPlanExporters';
import { FileCode, Download, Copy, Check, Plane, Compass, Share2 } from 'lucide-react';

interface ExportFlightPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: FlightPlanWaypoint[];
}

export const ExportFlightPlanModal: React.FC<ExportFlightPlanModalProps> = ({
  isOpen,
  onClose,
  waypoints,
}) => {
  const [copiedString, setCopiedString] = useState<boolean>(false);

  if (!isOpen) return null;

  const originIcao = waypoints.length > 0 ? waypoints[0].identifier : 'SBGR';
  const destIcao = waypoints.length > 1 ? waypoints[waypoints.length - 1].identifier : 'SBSP';
  const icaoRoute = buildIcaoRouteString(waypoints);

  const handleCopyIcao = () => {
    navigator.clipboard.writeText(icaoRoute);
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Exportar Plano de Voo</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {originIcao} ➔ {destIcao}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* SimBrief / ICAO Route String Box */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            String da Rota ICAO / SimBrief
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={icaoRoute}
              className="flex-1 font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
            <button
              onClick={handleCopyIcao}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedString ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              exportMsfsPlnFile(`PLANO_${originIcao}_${destIcao}`, waypoints);
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              <span>Baixar Arquivo MSFS 2020/2024 (.PLN)</span>
            </div>
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              exportGpxFile(`ROTA_${originIcao}_${destIcao}`, waypoints);
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Baixar Rota GPS Universal (.GPX)</span>
            </div>
            <Download className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-400 font-medium">
            O arquivo .PLN pode ser carregado diretamente na tela de "World Map" do MSFS.
          </p>
        </div>
      </div>
    </div>
  );
};
