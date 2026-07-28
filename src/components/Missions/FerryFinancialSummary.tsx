import React from 'react';
import { Coins, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface FerryFinancialSummaryProps {
  grossRewardCr: number;
  rewardXp: number;
  exportFeeCr: number;
  nationalizationFeeCr: number;
  exportFeeStatus: 'pending' | 'paid_credits' | 'paid_advance';
  nationalizationFeeStatus: 'pending' | 'paid_credits' | 'paid_advance';
  playerCredits: number;
}

export const FerryFinancialSummary: React.FC<FerryFinancialSummaryProps> = ({
  grossRewardCr,
  rewardXp,
  exportFeeCr,
  nationalizationFeeCr,
  exportFeeStatus,
  nationalizationFeeStatus,
  playerCredits,
}) => {
  // Calculate total advances requested from contractor
  const advancesTotal =
    (exportFeeStatus === 'paid_advance' ? exportFeeCr : 0) +
    (nationalizationFeeStatus === 'paid_advance' ? nationalizationFeeCr : 0);

  // Calculate net payout
  const netPayout = Math.max(0, grossRewardCr - advancesTotal);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-200/90 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase">Resumo Financeiro & Adiantamentos</h4>
            <p className="text-[10px] text-amber-800/80">Cálculo transparente de taxas, adiantamentos e saldo líquido</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Seu Saldo Atual</span>
          <span className="text-xs font-black text-slate-800 font-mono">
            {playerCredits.toLocaleString('pt-BR')} CR
          </span>
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2 text-xs">
        {/* Gross Reward */}
        <div className="flex items-center justify-between text-slate-700">
          <span className="font-medium">Recompensa Bruta do Contrato:</span>
          <span className="font-bold text-slate-900 font-mono">+{grossRewardCr.toLocaleString('pt-BR')} CR</span>
        </div>

        {/* Export Fee Row */}
        <div className="flex items-center justify-between text-slate-600 pl-2 border-l-2 border-slate-300">
          <span className="text-[11px] flex items-center gap-1.5">
            Taxa de Exportação & Seguro (Origem):
            {exportFeeStatus === 'paid_credits' && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Paga em CR</span>
            )}
            {exportFeeStatus === 'paid_advance' && (
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">Adiantamento da Contratante</span>
            )}
            {exportFeeStatus === 'pending' && (
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">Pendente</span>
            )}
          </span>
          <span className={`font-mono text-[11px] ${exportFeeStatus === 'paid_advance' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
            {exportFeeStatus === 'paid_advance' ? `- ${exportFeeCr.toLocaleString('pt-BR')} CR` : `${exportFeeCr.toLocaleString('pt-BR')} CR`}
          </span>
        </div>

        {/* Nationalization Fee Row */}
        <div className="flex items-center justify-between text-slate-600 pl-2 border-l-2 border-slate-300">
          <span className="text-[11px] flex items-center gap-1.5">
            Taxa de Nacionalização & Vistoria (Destino):
            {nationalizationFeeStatus === 'paid_credits' && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Paga em CR</span>
            )}
            {nationalizationFeeStatus === 'paid_advance' && (
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">Adiantamento da Contratante</span>
            )}
            {nationalizationFeeStatus === 'pending' && (
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">Pendente</span>
            )}
          </span>
          <span className={`font-mono text-[11px] ${nationalizationFeeStatus === 'paid_advance' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
            {nationalizationFeeStatus === 'paid_advance' ? `- ${nationalizationFeeCr.toLocaleString('pt-BR')} CR` : `${nationalizationFeeCr.toLocaleString('pt-BR')} CR`}
          </span>
        </div>

        {/* Advances Total Notice */}
        {advancesTotal > 0 && (
          <div className="p-2 rounded bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Total de Adiantamentos Cobertos pela Contratante:
            </span>
            <span className="text-red-700 font-mono font-black">- {advancesTotal.toLocaleString('pt-BR')} CR</span>
          </div>
        )}

        {/* Final Net Payout Box */}
        <div className="pt-2 border-t border-amber-200 flex items-center justify-between bg-white p-3 rounded-lg border border-amber-300/80 shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-800 block">Pagamento Líquido Final a Receber</span>
            <span className="text-[10px] text-slate-500">Valor creditado no seu perfil na entrega</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-lg font-black text-amber-900 font-mono block">
                {netPayout.toLocaleString('pt-BR')} CR
              </span>
            </div>

            <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200 inline-flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              +{rewardXp} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
