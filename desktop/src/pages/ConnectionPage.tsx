import { useEffect, useState } from "react";
import { Cable, Play, RefreshCw, Square, Usb, Settings, Save } from "lucide-react";
import { invoke, isTauri } from "../lib/bridge";
import type { ConnStatus, PortInfo } from "../lib/types";

interface Props {
  conn: ConnStatus;
}

export default function ConnectionPage({ conn }: Props) {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Configuracoes de inicializacao
  const [startupSource, setStartupSource] = useState("none");
  const [defaultPort, setDefaultPort] = useState("");
  const [savedStartup, setSavedStartup] = useState(false);

  async function refreshPorts() {
    setBusy(true);
    setError("");
    try {
      const list = await invoke<PortInfo[]>("list_serial_ports");
      setPorts(list);
      if (list.length > 0 && !selected) setSelected(list[0].name);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function loadStartupSettings() {
    try {
      const mode = await invoke<string | null>("load_setting", { key: "startup_source" });
      if (mode) setStartupSource(mode);

      const port = await invoke<string | null>("load_setting", { key: "default_serial_port" });
      if (port) setDefaultPort(port);
    } catch (e) {
      console.error("Erro ao carregar configuracoes de inicializacao:", e);
    }
  }

  useEffect(() => {
    refreshPorts();
    loadStartupSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setError("");
    try {
      await invoke("connect_serial", { port: selected });
    } catch (e) {
      setError(String(e));
    }
  }

  async function startSim() {
    setError("");
    await invoke("start_simulator", { intervalMs: 2000 });
  }

  async function stop() {
    await invoke("stop_source");
  }

  async function saveStartupConfig() {
    try {
      await invoke("save_setting", { key: "startup_source", value: startupSource });
      await invoke("save_setting", { key: "default_serial_port", value: defaultPort });
      setSavedStartup(true);
      setTimeout(() => setSavedStartup(false), 2000);
    } catch (e) {
      setError(String(e));
    }
  }

  const stateColor =
    conn.state === "connected"
      ? "text-leaf-400"
      : conn.state === "reconnecting"
        ? "text-amber-400"
        : "text-gray-500";

  return (
    <div className="max-w-3xl space-y-4">
      {/* Status da conexao */}
      <div className="card">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
          <Cable size={16} /> Status da conexão
        </h3>
        <p className={`text-lg font-semibold ${stateColor}`}>
          {conn.state === "connected"
            ? `Conectado — ${conn.port}`
            : conn.state === "reconnecting"
              ? `Reconectando ${conn.port}…`
              : "Desconectado"}
        </p>
        {conn.detail && <p className="text-xs text-gray-500">{conn.detail}</p>}
      </div>

      {/* Parametros de Inicializacao */}
      <div className="card space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400">
          <Settings size={16} /> Configurações de Inicialização
        </h3>
        <p className="text-xs text-gray-500">
          Defina se o aplicativo deve conectar automaticamente a um dispositivo real ou simular leituras ao ser iniciado.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500">Modo de Inicialização</span>
            <select
              className="input w-full text-xs"
              value={startupSource}
              onChange={(e) => setStartupSource(e.target.value)}
            >
              <option value="none">Desconectado (Aguardar ação)</option>
              <option value="simulator">Simulador (Modo Demo)</option>
              <option value="serial">Dispositivo Real (Serial USB)</option>
            </select>
          </label>

          {startupSource === "serial" && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-gray-500">Porta Serial Padrão</span>
              <select
                className="input w-full text-xs"
                value={defaultPort}
                onChange={(e) => setDefaultPort(e.target.value)}
              >
                <option value="">Selecione uma porta...</option>
                {ports.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.chip})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <button
          className="btn-primary py-1.5 text-xs"
          onClick={saveStartupConfig}
          disabled={startupSource === "serial" && !defaultPort}
        >
          <Save size={14} /> {savedStartup ? "Salvo!" : "Salvar Configuração"}
        </button>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Usb size={16} /> Portas seriais (ESP32)
          </h3>
          <button className="btn-ghost text-xs" onClick={refreshPorts} disabled={busy}>
            <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Atualizar
          </button>
        </div>

        {!isTauri && (
          <p className="rounded-lg border border-amber-900 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
            Você está no modo demo (navegador). A comunicação serial real só está
            disponível no aplicativo desktop compilado.
          </p>
        )}

        {ports.length === 0 ? (
          <p className="text-sm text-gray-600">
            Nenhuma porta encontrada. Conecte a ESP32 via USB e atualize — se o
            dispositivo não aparecer, instale o driver na aba Dependências.
          </p>
        ) : (
          <div className="space-y-2">
            {ports.map((p) => (
              <label
                key={p.name}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                  selected === p.name
                    ? "border-leaf-600 bg-leaf-600/10"
                    : "border-surface-border hover:bg-surface-overlay"
                }`}
              >
                <input
                  type="radio"
                  name="port"
                  className="accent-leaf-500"
                  checked={selected === p.name}
                  onChange={() => setSelected(p.name)}
                />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {p.chip}
                    {p.description ? ` — ${p.description}` : ""}
                    {p.vid != null
                      ? ` (${p.vid.toString(16).padStart(4, "0")}:${(p.pid ?? 0)
                          .toString(16)
                          .padStart(4, "0")})`
                      : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button className="btn-primary" onClick={connect} disabled={!selected || ports.length === 0}>
            <Cable size={16} /> Conectar ESP32
          </button>
          <button className="btn-ghost" onClick={startSim}>
            <Play size={16} /> Modo demo (simulador)
          </button>
          <button className="btn-ghost" onClick={stop}>
            <Square size={16} /> Parar
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="card text-xs leading-relaxed text-gray-500">
        <p className="mb-1 font-medium text-gray-400">Formato esperado do firmware (NDJSON @ 115200 baud):</p>
        <code className="block rounded bg-surface p-2 font-mono">
          {`{"soil_moisture":42.1,"air_temperature":27.3,"air_humidity":61.0,"light_level":18500,"soil_temperature":24.0,"co2_level":480,"ph_level":6.4}`}
        </code>
        <p className="mt-1">Uma linha JSON por leitura. Campos ausentes são tolerados.</p>
      </div>
    </div>
  );
}
