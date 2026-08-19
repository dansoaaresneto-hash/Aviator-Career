import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AirportSample } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { Search, MapPin, Building, ShieldCheck, X, ChevronDown, Check } from 'lucide-react';

interface AirportSearchSelectProps {
  value: string; // ICAO selecionado
  onChange: (icao: string, airport?: AirportSample) => void;
  placeholder?: string;
  disabled?: boolean;
  filterPoeOnly?: boolean;
  suggestedIcaos?: string[];
  id?: string;
}

export const AirportSearchSelect: React.FC<AirportSearchSelectProps> = ({
  value,
  onChange,
  placeholder = 'Digite o nome, ICAO ou cidade do aeroporto...',
  disabled = false,
  filterPoeOnly = false,
  suggestedIcaos = [],
  id = 'airport-search-select',
}) => {
  const { airportPool } = usePilot();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Aeroporto atualmente selecionado
  const selectedAirport = useMemo(() => {
    return airportPool.find((a) => a.icao.toUpperCase() === value.toUpperCase());
  }, [airportPool, value]);

  // Sincroniza query com o valor atual ao carregar ou mudar externamente
  useEffect(() => {
    if (selectedAirport) {
      setQuery(`${selectedAirport.icao} - ${selectedAirport.name}`);
    } else if (value) {
      setQuery(value);
    } else {
      setQuery('');
    }
  }, [selectedAirport, value]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Restaura texto correspondente ao item selecionado se fechou sem selecionar
        if (selectedAirport) {
          setQuery(`${selectedAirport.icao} - ${selectedAirport.name}`);
        } else if (value) {
          setQuery(value);
        } else {
          setQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedAirport, value]);

  // Filtra aeroportos do Supabase em memória pelo termo digitado
  const filteredAirports = useMemo(() => {
    let pool = airportPool;
    if (filterPoeOnly) {
      pool = pool.filter((a) => a.isPortOfEntry);
    }

    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) {
      // Se não digitou nada, mostra sugeridos + primeiros da lista
      if (suggestedIcaos.length > 0) {
        const suggested = pool.filter((a) => suggestedIcaos.includes(a.icao));
        const others = pool.filter((a) => !suggestedIcaos.includes(a.icao)).slice(0, 30);
        return [...suggested, ...others];
      }
      return pool.slice(0, 40);
    }

    // Se o texto é exatamente a representação do selecionado, ainda mostra opções
    const searchTerm = (selectedAirport && query === `${selectedAirport.icao} - ${selectedAirport.name}`)
      ? ''
      : cleanQuery;

    if (!searchTerm) {
      return pool.slice(0, 40);
    }

    return pool
      .filter((a) => {
        const icaoMatch = a.icao.toUpperCase().includes(searchTerm);
        const nameMatch = a.name.toUpperCase().includes(searchTerm);
        const cityMatch = a.city ? a.city.toUpperCase().includes(searchTerm) : false;
        const countryMatch = a.country ? a.country.toUpperCase().includes(searchTerm) : false;
        return icaoMatch || nameMatch || cityMatch || countryMatch;
      })
      .slice(0, 50); // Limita a 50 itens para renderização fluida
  }, [airportPool, query, filterPoeOnly, suggestedIcaos, selectedAirport]);

  const handleSelect = (airport: AirportSample) => {
    onChange(airport.icao, airport);
    setQuery(`${airport.icao} - ${airport.name}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              // Limpa query visual para facilitar busca rápida se estava exibindo o nome completo
              if (selectedAirport && query === `${selectedAirport.icao} - ${selectedAirport.name}`) {
                // Mantém selecionado mas permite digitar imediatamente
              }
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          className={`w-full pl-9 pr-16 py-2 bg-slate-50 border rounded-lg text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-slate-100 ${
            isOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-300'
          }`}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Limpar seleção"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown de Resultados do Supabase */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Building className="w-3 h-3 text-sky-600" />
              Base Supabase ({airportPool.length} aeroportos)
            </span>
            <span>{filteredAirports.length} encontrados</span>
          </div>

          {filteredAirports.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium">Nenhum aeroporto encontrado</p>
              <p className="text-[10px] text-slate-400">Tente buscar por ICAO (ex: SBGR, KMIA), cidade ou nome.</p>
            </div>
          ) : (
            filteredAirports.map((airport) => {
              const isSelected = value.toUpperCase() === airport.icao.toUpperCase();
              return (
                <button
                  key={airport.icao}
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between gap-2 hover:bg-sky-50 cursor-pointer ${
                    isSelected ? 'bg-sky-50 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-[10px] font-black ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {airport.icao.substring(0, 4)}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900">{airport.icao}</span>
                        <span className="text-[10px] text-slate-500 truncate font-normal">
                          · {airport.city || airport.country || ''}
                        </span>
                        {airport.isPortOfEntry && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> POE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{airport.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {airport.country || 'INTL'}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
