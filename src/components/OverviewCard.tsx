import React from 'react';
import { AgreementMeta, PaymentItem } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/formatters';
import { Calendar, UserCheck, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OverviewCardProps {
  meta: AgreementMeta;
  payments: PaymentItem[];
  isAdmin: boolean;
  onLockAdmin: () => void;
  onQuickPayNext: () => void;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  meta,
  payments,
  isAdmin,
  onLockAdmin,
  onQuickPayNext,
}) => {
  const paidCount = payments.filter((p) => p.status === 'Paid').length;
  const totalCount = payments.length;
  const progressPercent = Math.round((paidCount / totalCount) * 100);

  const totalPaid = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = meta.totalAmount - totalPaid;

  // Find next pending payment
  const nextPending = payments.find((p) => p.status === 'Pending');
  const nextDueInfo = nextPending ? getDaysRemaining(nextPending.dueDateISO) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Admin Notice Bar */}
      {isAdmin && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Unlocked (Password: ramazan) · You can toggle paid months and edit reference logs.</span>
          </div>
          <button
            onClick={onLockAdmin}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0"
          >
            Lock Admin
          </button>
        </div>
      )}

      {/* Main Stats Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-emerald-400">
              Official Payment Plan
            </span>
            <span className="font-mono text-slate-400">
              Created {meta.dateGenerated}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Agreement Amount</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-tabular mt-0.5">
                {formatCurrency(meta.totalAmount)}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {meta.payer}
                </span>
                <span className="text-slate-500">→</span>
                <span className="font-medium text-slate-200">{meta.receiver}</span>
              </div>
            </div>

            {/* Quick Balance Breakdown */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-700/60 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Paid</p>
                <p className="text-base sm:text-lg font-bold text-emerald-400 font-tabular mt-0.5">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {paidCount} of {totalCount} months
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Remaining Balance</p>
                <p className="text-base sm:text-lg font-bold text-slate-100 font-tabular mt-0.5">
                  {formatCurrency(remainingBalance)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {totalCount - paidCount} months pending
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Progress:</span>
                <span className="text-emerald-400 font-bold">{progressPercent}% Completed</span>
              </span>
              <span className="text-slate-400 font-mono">
                {paidCount} / {totalCount} Installments
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next Due / Action Bar */}
      <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {nextPending ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Next Due: #{nextPending.monthNum} · {nextPending.dueDate}
                </span>
                {nextDueInfo && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      nextDueInfo.isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : nextDueInfo.isDueSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {nextDueInfo.text}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-tabular">
                Monthly Amount: <span className="font-semibold text-slate-700">{formatCurrency(nextPending.amount)}</span> via {nextPending.method}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Congratulations! All 6 installments are fully settled.
            </span>
          </div>
        )}

        {nextPending && (
          <button
            onClick={onQuickPayNext}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
          >
            <span>{isAdmin ? 'Toggle Next Paid' : 'Record / Pay Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
