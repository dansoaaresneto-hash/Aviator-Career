import React from 'react';
import { Contract, CommsMessage, RegulatoryBody } from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import {
  Radio,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

interface AcarsCommsSectionProps {
  contract: Contract;
}

export const AcarsCommsSection: React.FC<AcarsCommsSectionProps> = ({ contract }) => {
  const { commsMessages, regulatoryBodies, markCommsMessageRead } = usePilot();

  const messages = commsMessages.filter((m) => m.contractId === contract.id);
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200 font-mono">
                ACARS · Datalink Teletype
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount} não lida(s)
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Comunicações & Despachos Oficiais
            </h3>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono font-bold">
          Frequência Operacional: 131.550 MHz
        </span>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200/90 shadow-sm text-slate-500 space-y-2">
          <Radio className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Nenhum teletipo recebido no momento.</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mensagens de autorização de rota, aprovações alfandegárias e avisos meteorológicos aparecerão aqui conforme o progresso do voo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const body = regulatoryBodies.find((b) => b.id === msg.senderBodyId);

            return (
              <div
                key={msg.id}
                onClick={() => !msg.isRead && markCommsMessageRead(msg.id)}
                className={`p-4 rounded-xl border transition-all ${
                  msg.isRead
                    ? 'bg-white border-slate-200'
                    : 'bg-sky-50/70 border-sky-300 shadow-xs ring-1 ring-sky-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
                      {body?.shortName || 'DESPACHO'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{msg.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.timestamp).toLocaleTimeString('pt-BR')}</span>
                    {msg.isRead ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-sky-500 ml-1" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {msg.body}
                </p>

                {msg.clearanceCode && (
                  <div className="mt-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block font-bold">
                    Código de Liberação: {msg.clearanceCode}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
