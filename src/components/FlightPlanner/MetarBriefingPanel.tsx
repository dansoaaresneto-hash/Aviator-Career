import React, { useEffect, useState } from 'react';
import { MetarData } from '../../types';
import { fetchMetar } from '../../utils/airacService';
import { CloudSun, Wind, Thermometer, Eye, Gauge, Copy, Check, RefreshCw } from 'lucide-react';

interface MetarBriefingPanelProps {
  originIcao?: string;
  destIcao?: string;
}

export const MetarBriefingPanel: React.FC<MetarBriefingPanelProps> = ({
  originIcao = 'SBGR',
  destIcao = 'SBSP',
}) => {
  const [originMetar, setOriginMetar] = useState<MetarData | null>(null);
  const [destMetar, setDestMetar] = useState<MetarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<string | null>(null);

  const loadWeather = async () => {
    setIsLoading(true);
    try {
      const [m1, m2] = await Promise.all([fetchMetar(originIcao), fetchMetar(destIcao)]);
      setOriginMetar(m1);
      setDestMetar(m2);
    } catch (e) {
      console.warn('METAR load notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [originIcao, destIcao]);

  const categoryColor = (cat?: 'VFR' | 'MVFR' | 'IFR' | 'LIFR') => {
    switch (cat) {
      case 'VFR':
        return 'bg-emerald-500 text-white';
      case 'MVFR':
        return 'bg-sky-500 text-white';
      case 'IFR':
        return 'bg-rose-600 text-white';
      case 'LIFR':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaw(id);
    setTimeout(() => setCopiedRaw(null), 2000);
  };

  const renderMetarCard = (title: string, metar: MetarData | null, defaultIcao: string) => {
    const icao = metar?.icao || defaultIcao;

    return (
      <div className="bg-slate-900 rounded-xl p-3.5 text-white border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
            <span className="font-mono font-extrabold text-sm text-amber-300">{icao}</span>
          </div>

          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${categoryColor(metar?.flightCategory)}`}>
            {metar?.flightCategory || 'VFR'}
          </span>
        </div>

        {/* Decoded Weather Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" /> VENTO
            </span>
            <span className="font-bold text-slate-100">
              {metar?.windDirectionDeg || 120}° / {metar?.windSpeedKts || 10} KTS
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-400" /> TEMP / DEW
            </span>
            <span className="font-bold text-slate-100">
              {metar?.temperatureC || 24}°C / {metar?.dewPointC || 18}°C
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-400" /> VISIBILIDADE
            </span>
            <span className="font-bold text-slate-100">{metar?.visibilityKm || 10} km</span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Gauge className="w-3 h-3 text-indigo-400" /> PRESSÃO (QNH)
            </span>
            <span className="font-bold text-slate-100">{metar?.altimeterInHg.toFixed(2) || '29.92'} inHg</span>
          </div>
        </div>

        {/* Raw METAR Text Box */}
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between gap-2">
          <span className="truncate">{metar?.rawMetar || `${icao} METAR não disponível`}</span>
          <button
            onClick={() => copyToClipboard(metar?.rawMetar || '', icao)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copiar METAR Bruto"
          >
            {copiedRaw === icao ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Meteorologia METAR em Tempo Real</h3>
            <p className="text-[11px] text-slate-500 font-medium">Informações de teto, visibilidade e vento</p>
          </div>
        </div>

        <button
          onClick={loadWeather}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
          title="Atualizar METAR"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {renderMetarCard('METAR Origem', originMetar, originIcao)}
        {renderMetarCard('METAR Destino', destMetar, destIcao)}
      </div>
    </div>
  );
};
