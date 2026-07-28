# =========================================================
#  AVIATOR MSFS CONNECT - SIMULATOR BRIDGE CLIENT
#  Build automatico via GitHub Actions + PyInstaller
# =========================================================
import time
import os
import sys
import requests

# >>> TROQUE ISSO pela URL real do seu app no Vercel <<<
SERVER_URL = "https://aviator-career.vercel.app/api/telemetry"

# Guarda o token do usuario ao lado do .exe, para nao pedir de novo toda vez
BASE_DIR = os.path.dirname(os.path.abspath(sys.argv[0]))
TOKEN_FILE = os.path.join(BASE_DIR, "aviator_token.txt")


def get_token() -> str:
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r", encoding="utf-8") as f:
            saved = f.read().strip()
            if saved:
                return saved
    print("=========================================================")
    print("  Primeira execucao - configure seu Token PIN")
    print("  (voce encontra ele na aba 'Conector' dentro do Aviator)")
    print("=========================================================")
    token = input("Cole aqui seu Token PIN (ex: AV-894210): ").strip()
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        f.write(token)
    return token


TOKEN = get_token()

print("=========================================================")
print("  AVIATOR MSFS CONNECT - CONECTOR DE SIMULACAO")
print("  Token de Conexao: " + TOKEN)
print("  Servidor Alvo: " + SERVER_URL)
print("=========================================================")

try:
    from SimConnect import SimConnect, AircraftRequests
    print("[INFO] Tentando conectar ao MSFS via SimConnect...")
    sm = SimConnect()
    aq = AircraftRequests(sm, _time=2000)
    print("[OK] Conectado com sucesso ao Microsoft Flight Simulator!")
    has_simconnect = True
except Exception as e:
    print("[AVISO] SimConnect indisponivel ou MSFS ainda nao esta aberto: " + str(e))
    print("[INFO] Vou tentar novamente a cada ciclo. Abra o MSFS e carregue um voo.")
    has_simconnect = False
    sm = None
    aq = None


def try_connect_simconnect():
    global sm, aq, has_simconnect
    try:
        from SimConnect import SimConnect, AircraftRequests
        sm = SimConnect()
        aq = AircraftRequests(sm, _time=2000)
        has_simconnect = True
        print("[OK] Reconectado ao MSFS!")
    except Exception:
        has_simconnect = False


def get_telemetry():
    global has_simconnect
    if not has_simconnect:
        try_connect_simconnect()

    if has_simconnect:
        try:
            lat = aq.get("PLANE_LATITUDE")
            lon = aq.get("PLANE_LONGITUDE")
            alt = aq.get("PLANE_ALTITUDE") or 0
            speed = aq.get("AIRSPEED_INDICATED") or 0
            aircraft = aq.get("TITLE") or "Aeronave desconhecida"
            weight = aq.get("TOTAL_WEIGHT") or 0
            payload = aq.get("PAYLOAD_STATION_WEIGHT:1") or 0
            fuel = aq.get("FUEL_TOTAL_QUANTITY_WEIGHT") or 0
            on_ground = aq.get("SIM_ON_GROUND")

            if lat is None or lon is None:
                raise ValueError("SimConnect nao retornou posicao valida ainda")

            return {
                "token": TOKEN,
                "simName": "Microsoft Flight Simulator",
                "aircraftTitle": str(aircraft),
                "totalWeightKg": round(float(weight) * 0.453592, 1),
                "payloadKg": round(float(payload) * 0.453592, 1),
                "fuelKg": round(float(fuel) * 0.453592, 1),
                "latitude": float(lat),
                "longitude": float(lon),
                "altitudeFt": round(float(alt)),
                "groundSpeedKts": round(float(speed)),
                "onGround": bool(on_ground),
            }
        except Exception as err:
            print("[ERRO] Falha ao ler dados do SimConnect:", err)
            has_simconnect = False

    # Sem simulador aberto ainda - nao inventa aeroporto, so avisa
    return None


print("\nIniciando envio de telemetria a cada 3 segundos...")
print("Pressione Ctrl+C para encerrar.\n")

while True:
    try:
        payload = get_telemetry()
        if payload is None:
            print(f"[{time.strftime('%H:%M:%S')}] Aguardando MSFS abrir um voo...")
        else:
            res = requests.post(SERVER_URL, json=payload, timeout=5)
            if res.status_code == 200:
                print(f"[{time.strftime('%H:%M:%S')}] OK | Aeronave: {payload['aircraftTitle'][:25]} | "
                      f"Peso carga: {payload['payloadKg']}kg | Alt: {payload['altitudeFt']}ft")
            else:
                print(f"[{time.strftime('%H:%M:%S')}] Servidor respondeu codigo: {res.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Erro de conexao com o Aviator: {e}")

    time.sleep(3)
