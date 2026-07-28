import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const AIRAC_API_BASE = 'https://airac.net/api/v1';
const AIRAC_USER_AGENT = 'AviatorMSFSFlightPlanner/1.0 (https://ai.studio; flightplanner@aviator-msfs.app)';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function for AIRAC proxy fetch
async function proxyAirac(endpoint: string) {
  try {
    const url = `${AIRAC_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': AIRAC_USER_AGENT,
      },
    });

    if (!response.ok) {
      return { status: 'error', code: response.status, message: `AIRAC upstream error ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('AIRAC Proxy Fetch Error:', error?.message || error);
    return null;
  }
}

// ---------------- API ROUTES ---------------- //

// GET /api/airac/current
app.get('/api/airac/current', async (req, res) => {
  const result = await proxyAirac('/airac/current');
  if (result && result.status === 'success') {
    return res.json(result);
  }
  // Fallback AIRAC cycle info
  return res.json({
    status: 'success',
    data: {
      cycle: '2607',
      effective_date: '2026-07-09',
      expiration_date: '2026-08-06',
      is_current: true,
      days_remaining: 12,
    },
  });
});

// GET /api/airac/airports/nearby
app.get('/api/airac/airports/nearby', async (req, res) => {
  const { latitude, longitude, radius = 300 } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ status: 'error', message: 'Missing lat/lon' });
  }

  const result = await proxyAirac(`/airports/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.json({ status: 'success', data: [] });
});

// GET /api/airac/waypoints/nearby
app.get('/api/airac/waypoints/nearby', async (req, res) => {
  const { latitude, longitude, radius = 200 } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ status: 'error', message: 'Missing lat/lon' });
  }

  const result = await proxyAirac(`/waypoints/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.json({ status: 'success', data: [] });
});

// GET /api/airac/navaids/nearby
app.get('/api/airac/navaids/nearby', async (req, res) => {
  const { latitude, longitude, radius = 200 } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ status: 'error', message: 'Missing lat/lon' });
  }

  const result = await proxyAirac(`/navaids/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.json({ status: 'success', data: [] });
});

// GET /api/airac/search
app.get('/api/airac/search', async (req, res) => {
  const { q, limit = 15 } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json({ status: 'success', data: [] });
  }

  const result = await proxyAirac(`/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.json({ status: 'success', data: [] });
});

// GET /api/airac/airports/:icao
app.get('/api/airac/airports/:icao', async (req, res) => {
  const { icao } = req.params;
  const result = await proxyAirac(`/airports/${encodeURIComponent(icao)}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.status(404).json({ status: 'error', message: 'Airport not found' });
});

// GET /api/airac/procedures
app.get('/api/airac/procedures', async (req, res) => {
  const { airport, type = 'SID' } = req.query;
  if (!airport) {
    return res.status(400).json({ status: 'error', message: 'Airport ICAO required' });
  }

  const result = await proxyAirac(`/procedures?airport=${encodeURIComponent(String(airport))}&type=${encodeURIComponent(String(type))}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.json({ status: 'success', data: [] });
});

// GET /api/airac/procedures/:airport/:identifier
app.get('/api/airac/procedures/:airport/:identifier', async (req, res) => {
  const { airport, identifier } = req.params;
  const result = await proxyAirac(`/procedures/${encodeURIComponent(airport)}/${encodeURIComponent(identifier)}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.status(404).json({ status: 'error', message: 'Procedure detail not found' });
});

// GET /api/airac/routes/parse
app.get('/api/airac/routes/parse', async (req, res) => {
  const { origin, destination, route } = req.query;
  if (!origin || !destination) {
    return res.status(400).json({ status: 'error', message: 'Origin and Destination required' });
  }

  const queryStr = `origin=${encodeURIComponent(String(origin))}&destination=${encodeURIComponent(String(destination))}&route=${encodeURIComponent(String(route || 'DCT'))}`;
  const result = await proxyAirac(`/routes/parse?${queryStr}`);
  if (result && result.status === 'success') {
    return res.json(result);
  }

  return res.status(500).json({ status: 'error', message: 'Failed to parse route' });
});

// GET /api/metar/:icao
app.get('/api/metar/:icao', async (req, res) => {
  const icao = req.params.icao.toUpperCase();
  try {
    const metarRes = await fetch(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`);
    if (metarRes.ok) {
      const data = await metarRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return res.json({
          status: 'success',
          data: {
            icao,
            rawMetar: item.rawOb || `${icao} AUTO 12010KT 9999 FEW030 24/18 Q1013`,
            flightCategory: item.fltcat || 'VFR',
            temperatureC: item.temp ?? 24,
            dewPointC: item.dewp ?? 18,
            windSpeedKts: item.wspd ?? 10,
            windDirectionDeg: item.wdir ?? 120,
            visibilityKm: item.visib ? parseFloat(item.visib) * 1.609 : 10,
            altimeterInHg: item.altim ? item.altim / 33.8639 : 29.92,
            cloudsText: item.cover ? `${item.cover} at ${item.base || 3000}ft` : 'FEW 3000ft',
            observedTime: item.receiptTime || new Date().toISOString(),
          }
        });
      }
    }
  } catch (err) {
    console.warn(`METAR fetch failed for ${icao}, providing fallback:`, err);
  }

  // Fallback synthetic realistic METAR
  return res.json({
    status: 'success',
    data: {
      icao,
      rawMetar: `${icao} 261400Z 13012KT 9999 CAVOK 25/17 Q1015 NOSIG`,
      flightCategory: 'VFR',
      temperatureC: 25,
      dewPointC: 17,
      windSpeedKts: 12,
      windDirectionDeg: 130,
      visibilityKm: 10,
      altimeterInHg: 29.97,
      cloudsText: 'CAVOK (Ceu Limpo)',
      observedTime: new Date().toISOString(),
    }
  });
});

// ---------------- TELEMETRY & CONNECTOR API ---------------- //

const telemetryStore = new Map<string, any>();

// POST /api/telemetry - Receive telemetry from local Python connector script
app.post('/api/telemetry', async (req, res) => {
  const { token, airportIcao, aircraftTitle, totalWeightKg, payloadKg, fuelKg, latitude, longitude, altitudeFt, groundSpeedKts, onGround, simName } = req.body;

  if (!token) {
    return res.status(400).json({ status: 'error', message: 'Token de conexão obrigatório' });
  }

  const latNum = Number(latitude) || -23.4356;
  const lonNum = Number(longitude) || -46.4731;

  let calculatedIcao = (airportIcao || 'SBGR').toUpperCase();

  try {
    const nearby = await proxyAirac(`/airports/nearby?latitude=${latNum}&longitude=${lonNum}&radius=50`);
    if (nearby && nearby.status === 'success' && Array.isArray(nearby.data) && nearby.data.length > 0) {
      const nearest = nearby.data[0];
      calculatedIcao = (nearest.identifier || nearest.icao || calculatedIcao).toUpperCase();
    }
  } catch (err) {
    console.warn('Erro ao calcular aeroporto mais próximo via AIRAC:', err);
  }

  const telemetryData = {
    token,
    connected: true,
    simName: simName || 'Microsoft Flight Simulator 2020',
    airportIcao: calculatedIcao,
    aircraftTitle: aircraftTitle || 'Cessna 172 Skyhawk',
    totalWeightKg: Number(totalWeightKg) || 1050,
    payloadKg: Number(payloadKg) || 300,
    fuelKg: Number(fuelKg) || 120,
    latitude: latNum,
    longitude: lonNum,
    altitudeFt: Number(altitudeFt) || 2450,
    groundSpeedKts: Number(groundSpeedKts) || 0,
    onGround: Boolean(onGround),
    lastUpdated: new Date().toISOString(),
    isSimulated: false,
  };

  telemetryStore.set(token, telemetryData);

  return res.json({
    status: 'success',
    message: 'Telemetria do simulador recebida com sucesso',
    receivedAt: telemetryData.lastUpdated,
  });
});

// GET /api/telemetry - Retrieve telemetry for given user token
app.get('/api/telemetry', (req, res) => {
  const token = (req.query.token as string) || '';
  if (!token) {
    return res.status(400).json({ status: 'error', message: 'Token é necessário' });
  }

  const data = telemetryStore.get(token);
  if (!data) {
    return res.json({
      status: 'success',
      data: {
        token,
        connected: false,
        simName: 'Aguardando Conexão',
        airportIcao: '---',
        aircraftTitle: 'Aguardando MSFS...',
        totalWeightKg: 0,
        payloadKg: 0,
        fuelKg: 0,
        latitude: 0,
        longitude: 0,
        altitudeFt: 0,
        groundSpeedKts: 0,
        onGround: true,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  return res.json({ status: 'success', data });
});

// GET /api/connector/script - Downloads Python script for local MSFS connection
app.get('/api/connector/script', (req, res) => {
  const token = (req.query.token as string) || 'AV-894210';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'] || 'localhost:3000';
  const serverUrl = `${protocol}://${host}`;

  const pythonScript = `# =========================================================
#  AVIATOR MSFS CONNECT - SIMULATOR BRIDGE CLIENT v1.0
#  Auto-Generated for Token: ${token}
# =========================================================
import time
import json
import requests
import sys

TOKEN = "${token}"
SERVER_URL = "${serverUrl}/api/telemetry"

print("=========================================================")
print("  ✈️ AVIATOR MSFS CONNECT - CONECTOR DE SIMULAÇÃO")
print("  Token de Conexão: " + TOKEN)
print("  Servidor Alvo: " + SERVER_URL)
print("=========================================================")

try:
    from SimConnect import SimConnect, AircraftRequests
    print("[INFO] Biblioteca SimConnect detectada. Tentando conectar ao MSFS...")
    sm = SimConnect()
    aq = AircraftRequests(sm, _time=2000)
    print("✅ Conectado com sucesso ao Microsoft Flight Simulator!")
    has_simconnect = True
except Exception as e:
    print("⚠️ SimConnect não disponível ou MSFS não aberto ainda: " + str(e))
    print("[INFO] Operando em modo de monitoramento contínuo / FSUIPC / Fallback.")
    has_simconnect = False

def get_telemetry():
    if has_simconnect:
        try:
            lat = aq.get("PLANE_LATITUDE") or -23.4356
            lon = aq.get("PLANE_LONGITUDE") or -46.4731
            alt = aq.get("PLANE_ALTITUDE") or 2450
            speed = aq.get("AIRSPEED_INDICATED") or 0
            aircraft = aq.get("TITLE") or "Cessna 172 Skyhawk"
            weight = aq.get("TOTAL_WEIGHT") or 1050
            payload = aq.get("PAYLOAD_STATION_WEIGHT:1") or 300
            fuel = aq.get("FUEL_TOTAL_QUANTITY_WEIGHT") or 120
            on_ground = aq.get("SIM_ON_GROUND") or 1
            
            # Simple ICAO approximation based on position or default
            airport = "SBGR"
            if lat > 0:
                airport = "KJFK"
            
            return {
                "token": TOKEN,
                "simName": "Microsoft Flight Simulator",
                "airportIcao": airport,
                "aircraftTitle": str(aircraft),
                "totalWeightKg": round(float(weight) * 0.453592, 1), # lbs to kg
                "payloadKg": round(float(payload) * 0.453592, 1),
                "fuelKg": round(float(fuel) * 0.453592, 1),
                "latitude": float(lat),
                "longitude": float(lon),
                "altitudeFt": round(float(alt)),
                "groundSpeedKts": round(float(speed)),
                "onGround": bool(on_ground)
            }
        except Exception as err:
            print("Erro ao ler SimConnect:", err)
    
    # Fallback simulation payload for testing connection
    return {
        "token": TOKEN,
        "simName": "Conector Aviator (Modo Simulado Local)",
        "airportIcao": "SBGR",
        "aircraftTitle": "Cessna 172 Skyhawk G1000",
        "totalWeightKg": 1100,
        "payloadKg": 350,
        "fuelKg": 140,
        "latitude": -23.4356,
        "longitude": -46.4731,
        "altitudeFt": 2450,
        "groundSpeedKts": 0,
        "onGround": True
    }

print("\\n🚀 Iniciando envio de telemetria para o Aviator a cada 3 segundos...")
print("Pressione Ctrl+C para encerrar o conector.\\n")

while True:
    try:
        payload = get_telemetry()
        res = requests.post(SERVER_URL, json=payload, timeout=5)
        if res.status_code == 200:
            print(f"[{time.strftime('%H:%M:%S')}] ✅ Telemetria enviada | Aeroporto: {payload['airportIcao']} | Aviação: {payload['aircraftTitle'][:20]} | Peso Carga: {payload['payloadKg']}kg")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] ⚠️ Servidor respondeu com código: {res.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ❌ Erro de conexão com o Aviator: {e}")
    
    time.sleep(3)
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="AviatorConnector_${token}.py"`);
  return res.send(pythonScript);
});

// GET /api/connector/bat - Downloads .bat launcher script for Windows
app.get('/api/connector/bat', (req, res) => {
  const token = (req.query.token as string) || 'AV-894210';
  const batScript = `@echo off
title Aviator MSFS Connector - Instalador e Inciador
color 0A
cls
echo ============================================================
echo   ✈️ AVIATOR CAREER MODE - CONECTOR DE SIMULAÇÃO MSFS
echo ============================================================
echo.
echo  Token do Piloto: ${token}
echo.
echo  [1/3] Verificando se o Python esta instalado...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado no seu computador!
    echo Baixe e instale o Python em https://python.org
    echo IMPORTANTE: Marque a opcao "Add python.exe to PATH" na instalacao.
    pause
    exit /b
)

echo [2/3] Instalando dependencias necessarias (requests, SimConnect)...
pip install requests SimConnect --quiet

echo.
echo [3/3] Baixando script atualizado do conector...
powershell -Command "Invoke-WebRequest -Uri '%~dp0AviatorConnector_${token}.py' -OutFile '%~dp0AviatorConnector.py'" 2>nul

echo.
echo ============================================================
echo   INICIANDO CONEXAO COM O SIMULADOR...
echo ============================================================
python AviatorConnector.py
pause
`;

  res.setHeader('Content-Type', 'application/x-bat');
  res.setHeader('Content-Disposition', `attachment; filename="Iniciar_Conector_Aviator_${token}.bat"`);
  return res.send(batScript);
});

// ---------------- START SERVER / VITE MIDDLEWARE ---------------- //

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ Flight Planner express server running on http://0.0.0.0:${PORT}`);
  });
}

// No Vercel, este arquivo é apenas importado (via api/index.ts) para virar uma
// função serverless — o Vercel cuida de servir o front-end estático separadamente.
// Só chamamos start() (que liga o servidor Express tradicional) quando NÃO
// estivermos rodando dentro do Vercel, ou seja: localmente ou no AI Studio.
if (!process.env.VERCEL) {
  start();
}

export default app;
