import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SimTelemetryData, MissionValidationResult, ValidationItem, ValidationStatus } from '../types/telemetry';
import { Contract } from '../types';

interface TelemetryContextType {
  telemetry: SimTelemetryData;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  userToken: string;
  showConnectorModal: boolean;
  setShowConnectorModal: (show: boolean) => void;
  regenerateToken: () => void;
  updateTelemetry: (data: Partial<SimTelemetryData>) => void;
  validateContract: (contract: Contract | null, expectedOriginIcao?: string, currentFlightPhase?: string) => MissionValidationResult;
  isPolling: boolean;
  setIsPolling: (polling: boolean) => void;
}

const DEFAULT_TOKEN = () => {
  const saved = localStorage.getItem('aviator_sim_token');
  if (saved) return saved;
  const newToken = 'AV-' + Math.floor(100000 + Math.random() * 900000);
  localStorage.setItem('aviator_sim_token', newToken);
  return newToken;
};

const INITIAL_TELEMETRY: SimTelemetryData = {
  token: '',
  connected: false,
  simName: 'Desconectado',
  airportIcao: '---',
  airportName: 'Aguardando Simulador',
  aircraftTitle: 'Nenhuma Aeronave Detectada',
  aircraftCategory: 'Geral',
  totalWeightKg: 0,
  payloadKg: 0,
  fuelKg: 0,
  latitude: 0,
  longitude: 0,
  altitudeFt: 0,
  groundSpeedKts: 0,
  onGround: true,
  lastUpdated: new Date().toISOString(),
  isSimulated: false,
};

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string>(DEFAULT_TOKEN);
  const [showConnectorModal, setShowConnectorModal] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const [telemetry, setTelemetry] = useState<SimTelemetryData>(() => ({
    ...INITIAL_TELEMETRY,
    token: userToken,
  }));

  const regenerateToken = () => {
    const newToken = 'AV-' + Math.floor(100000 + Math.random() * 900000);
    setUserToken(newToken);
    localStorage.setItem('aviator_sim_token', newToken);
  };

  const updateTelemetry = useCallback((data: Partial<SimTelemetryData>) => {
    setTelemetry((prev) => {
      const updated = {
        ...prev,
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      if (updated.connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }

      return updated;
    });
  }, []);

  // Poll server for telemetry pushed by local connector python script
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telemetry?token=${encodeURIComponent(userToken)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            const data = json.data;
            const isFresh = new Date().getTime() - new Date(data.lastUpdated).getTime() < 12000;
            if (isFresh && data.connected) {
              setTelemetry({ ...data, isSimulated: false });
              setConnectionStatus('connected');
            } else {
              if (connectionStatus === 'connected') {
                setConnectionStatus('disconnected');
              }
            }
          }
        }
      } catch (err) {
        // Silent error handling for background polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userToken, isPolling, connectionStatus]);

  // Mission validation algorithm
  const validateContract = useCallback(
    (contract: Contract | null, expectedOriginIcao?: string, currentFlightPhase?: string): MissionValidationResult => {
      if (!contract) {
        return {
          overallStatus: 'pending',
          canDepart: false,
          summaryText: 'Nenhum contrato ativo no momento.',
          airportCheck: {
            key: 'airport',
            title: 'Aeroporto de Origem',
            status: 'pending',
            currentValue: telemetry.airportIcao || '---',
            requiredValue: '---',
            message: 'Nenhum voo selecionado.',
          },
          aircraftCheck: {
            key: 'aircraft',
            title: 'Modelo da Aeronave',
            status: 'pending',
            currentValue: telemetry.aircraftTitle || '---',
            requiredValue: '---',
            message: 'Nenhum voo selecionado.',
          },
          weightCheck: {
            key: 'weight',
            title: 'Peso e Carga Útil',
            status: 'pending',
            currentValue: `${telemetry.payloadKg} kg`,
            requiredValue: '---',
            message: 'Nenhum voo selecionado.',
          },
        };
      }

      const requiredOrigin = (expectedOriginIcao || contract.route.departureIcao || '').trim().toUpperCase();
      const isIntermediate = Boolean(expectedOriginIcao && expectedOriginIcao !== contract.route.departureIcao);

      // Check if flight is airborne or in progress
      const isAirborne = !telemetry.onGround || Number(telemetry.altitudeFt) > 150 || Number(telemetry.groundSpeedKts) > 35;
      const isInFlightPhase = currentFlightPhase === 'cruise' || currentFlightPhase === 'approach' || (currentFlightPhase === 'taxi' && !telemetry.onGround);
      const isFlightInProgress = isAirborne || isInFlightPhase;

      if (connectionStatus === 'disconnected' && !telemetry.connected) {
        return {
          overallStatus: 'pending',
          canDepart: false,
          summaryText: 'Conecte o MSFS via conector do Aviator para validar seu voo.',
          airportCheck: {
            key: 'airport',
            title: isIntermediate ? 'Última Posição Registrada' : 'Aeroporto de Origem',
            status: 'pending',
            currentValue: 'Aguardando MSFS',
            requiredValue: isIntermediate
              ? `${requiredOrigin} (Escala/Posição Salva)`
              : `${requiredOrigin} (${contract.route.departureCity})`,
            message: 'Aguardando conexão com o simulador.',
          },
          aircraftCheck: {
            key: 'aircraft',
            title: 'Modelo da Aeronave',
            status: 'pending',
            currentValue: 'Aguardando MSFS',
            requiredValue: contract.requiredAircraft,
            message: 'Aguardando leitura da aeronave no simulador.',
          },
          weightCheck: {
            key: 'weight',
            title: 'Peso e Carga Útil',
            status: 'pending',
            currentValue: 'Aguardando MSFS',
            requiredValue: contract.payloadInfo,
            message: 'Aguardando leitura de peso no simulador.',
          },
        };
      }

      // 1. Airport Validation
      const currentAirport = (telemetry.airportIcao || '').trim().toUpperCase();

      let airportStatus: ValidationStatus = 'invalid';
      let airportMsg = '';

      if (isFlightInProgress) {
        airportStatus = 'valid';
        airportMsg = isIntermediate
          ? `Voo em andamento: decolagem efetuada da posição salva (${requiredOrigin}) rumo ao destino (${contract.route.arrivalIcao}).`
          : `Voo em andamento: decolagem efetuada do aeroporto de origem (${requiredOrigin}) com destino a ${contract.route.arrivalIcao}.`;
      } else if (currentAirport === requiredOrigin) {
        airportStatus = 'valid';
        airportMsg = isIntermediate
          ? `Localização confirmada na posição atual/escala (${requiredOrigin}). Decolagem autorizada rumo ao destino final (${contract.route.arrivalIcao}).`
          : `Localização confirmada no aeroporto de partida ${requiredOrigin}.`;
      } else {
        airportStatus = 'invalid';
        airportMsg = isIntermediate
          ? `Sua aeronave está em "${currentAirport || 'Desconhecido'}", mas a última posição salva desta missão é "${requiredOrigin}". Mova a aeronave para ${requiredOrigin} para continuar o voo.`
          : `Você está posicionado em "${currentAirport || 'Desconhecido'}", porém a missão exige partida em "${requiredOrigin}" (${contract.route.departureCity}). Mova a aeronave para ${requiredOrigin}.`;
      }

      // 2. Aircraft Validation
      const currentAircraft = (telemetry.aircraftTitle || '').toLowerCase();
      const reqAircraft = (contract.requiredAircraft || '').toLowerCase();
      const reqCategory = (contract.aircraftCategory || '').toLowerCase();

      let aircraftStatus: ValidationStatus = 'invalid';
      let aircraftMsg = '';

      // Check direct name match or keywords
      const reqKeywords = reqAircraft.split(' ').filter((w) => w.length > 2);
      const isDirectMatch =
        currentAircraft.includes(reqAircraft) ||
        reqAircraft.includes(currentAircraft) ||
        reqKeywords.some((kw) => currentAircraft.includes(kw));

      const isCategoryMatch =
        reqCategory.includes('qualquer') ||
        reqCategory.includes('frota') ||
        (reqCategory.includes('monomotor') && (currentAircraft.includes('172') || currentAircraft.includes('cessna') || currentAircraft.includes('piper') || currentAircraft.includes('bonanza'))) ||
        (reqCategory.includes('bimotor') && (currentAircraft.includes('baron') || currentAircraft.includes('king') || currentAircraft.includes('seneca') || currentAircraft.includes('twin')));

      if (isDirectMatch) {
        aircraftStatus = 'valid';
        aircraftMsg = `Aeronave exata validada no simulador (${telemetry.aircraftTitle}).`;
      } else if (isCategoryMatch) {
        aircraftStatus = 'warning';
        aircraftMsg = `Aeronave (${telemetry.aircraftTitle}) é compatível com a categoria contratada (${contract.aircraftCategory}).`;
      } else {
        aircraftStatus = 'invalid';
        aircraftMsg = `Aeronave em uso no MSFS (${telemetry.aircraftTitle}) diverge do contrato (${contract.requiredAircraft}).`;
      }

      // 3. Weight & Payload Validation
      let expectedPayloadKg = 0;
      const numMatch = contract.payloadInfo.match(/(\d+)\s*kg/i);
      if (numMatch) {
        expectedPayloadKg = parseInt(numMatch[1], 10);
      } else if (contract.payloadInfo.toLowerCase().includes('executivo') || contract.payloadInfo.toLowerCase().includes('pax') || contract.payloadInfo.toLowerCase().includes('passageiro')) {
        const paxMatch = contract.payloadInfo.match(/(\d+)/);
        const paxCount = paxMatch ? parseInt(paxMatch[1], 10) : 2;
        expectedPayloadKg = paxCount * 80; // 80kg per passenger average
      } else {
        expectedPayloadKg = 250; // default fallback
      }

      let weightStatus: ValidationStatus = 'invalid';
      let weightMsg = '';
      const actualPayload = telemetry.payloadKg || 0;
      const diffKg = Math.abs(actualPayload - expectedPayloadKg);

      if (isFlightInProgress && actualPayload > 0) {
        weightStatus = 'valid';
        weightMsg = `Carga e passageiros validados em voo (${actualPayload} kg embarcados em ${requiredOrigin}).`;
      } else if (actualPayload === 0 && expectedPayloadKg > 0) {
        weightStatus = 'invalid';
        weightMsg = `A aeronave está sem carga/passageiros no MSFS. Adicione ~${expectedPayloadKg} kg no menu do simulador.`;
      } else if (diffKg <= 80) {
        weightStatus = 'valid';
        weightMsg = `Carga e passageiros validados (${actualPayload} kg vs ~${expectedPayloadKg} kg exigidos).`;
      } else if (diffKg <= 200) {
        weightStatus = 'warning';
        weightMsg = `Peso no MSFS (${actualPayload} kg) possui variação aceitável em relação à missão (~${expectedPayloadKg} kg).`;
      } else {
        weightStatus = 'invalid';
        weightMsg = `Divergência de peso no MSFS (${actualPayload} kg no MSFS vs ~${expectedPayloadKg} kg contratados). Ajuste o peso antes de decolar.`;
      }

      // Overall resolution
      const isAllValid = airportStatus === 'valid' && (aircraftStatus === 'valid' || aircraftStatus === 'warning') && (weightStatus === 'valid' || weightStatus === 'warning');

      const isAnyInvalid = airportStatus === 'invalid' || aircraftStatus === 'invalid' || weightStatus === 'invalid';

      let overallStatus: 'approved' | 'warning' | 'rejected' | 'pending' = 'rejected';
      let canDepart = false;
      let summaryText = '';

      if (isFlightInProgress && (aircraftStatus === 'valid' || aircraftStatus === 'warning')) {
        overallStatus = aircraftStatus === 'warning' ? 'warning' : 'approved';
        canDepart = true;
        summaryText = `🟢 Voo em andamento! Perna ativa: ${requiredOrigin} ➔ ${contract.route.arrivalIcao}. Telemetria sendo monitorada.`;
      } else if (isAllValid) {
        overallStatus = aircraftStatus === 'warning' || weightStatus === 'warning' ? 'warning' : 'approved';
        canDepart = true;
        summaryText = '🟢 Voo validado com sucesso! Sua aeronave e aeroporto correspondem à missão.';
      } else if (isAnyInvalid) {
        overallStatus = 'rejected';
        canDepart = false;
        summaryText = '🔴 O voo não pode ser iniciado ainda. Corrija as inconsistências indicadas abaixo.';
      }

      return {
        overallStatus,
        canDepart,
        summaryText,
        airportCheck: {
          key: 'airport',
          title: isIntermediate ? 'Perna / Posição Atual' : 'Aeroporto de Origem',
          status: airportStatus,
          currentValue: isFlightInProgress
            ? (currentAirport ? `${currentAirport} (Em Voo)` : `Em Voo (Decolou de ${requiredOrigin})`)
            : (currentAirport || 'Indefinido'),
          requiredValue: isIntermediate
            ? `${requiredOrigin} (Perna p/ ${contract.route.arrivalIcao})`
            : `${contract.route.departureIcao} (${contract.route.departureCity})`,
          message: airportMsg,
        },
        aircraftCheck: {
          key: 'aircraft',
          title: 'Modelo da Aeronave',
          status: aircraftStatus,
          currentValue: telemetry.aircraftTitle || 'Indefinido',
          requiredValue: contract.requiredAircraft,
          message: aircraftMsg,
        },
        weightCheck: {
          key: 'weight',
          title: 'Peso e Carga Útil',
          status: weightStatus,
          currentValue: `${telemetry.payloadKg} kg (Total: ${telemetry.totalWeightKg} kg)`,
          requiredValue: `~${expectedPayloadKg} kg (${contract.payloadInfo})`,
          message: weightMsg,
        },
      };
    },
    [telemetry, connectionStatus]
  );

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        connectionStatus,
        userToken,
        showConnectorModal,
        setShowConnectorModal,
        regenerateToken,
        updateTelemetry,
        validateContract,
        isPolling,
        setIsPolling,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
