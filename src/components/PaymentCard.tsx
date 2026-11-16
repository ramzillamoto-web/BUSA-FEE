import React, { useState } from 'react';
import { PaymentItem } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/formatters';
import { Check, Clock, Copy, Edit3, CheckCheck, Hash, Calendar } from 'lucide-react';

interface PaymentCardProps {
  payment: PaymentItem;
  isAdmin: boolean;
  onToggleStatus: (payment: PaymentItem) => void;
  onOpenEditModal: (payment: PaymentItem) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  isAdmin,
  onToggleStatus,
  onOpenEditModal,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const isPaid = payment.status === 'Paid';
  const dueInfo = !isPaid ? getDaysRemaining(payment.dueDateISO) : null;

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (payment.referenceNo) {
      navigator.clipboard.writeText(payment.referenceNo);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isPaid
          ? 'bg-white border-emerald-200/80 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                #{payment.monthNum}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Installment {payment.monthNum} of 06
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Maya
              </span>
            </div>

            <div className="pt-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {payment.dueDate}
              </h3>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 font-tabular">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>

          {/* Right: Admin Toggle Switch */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  isPaid ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {isPaid ? 'Paid' : 'Pending'}
              </span>

              {/* Interactive Switch with min-h-[44px] min-w-[44px] hitbox */}
              <button
                type="button"
                role="switch"
                aria-checked={isPaid}
                onClick={() => onToggleStatus(payment)}
                title={isAdmin ? `Toggle #${payment.monthNum} Status` : 'Admin authentication required'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
              >
                <div
                  className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    isPaid ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                      isPaid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {isPaid ? (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    ) : (
                      <Clock className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Quick status cue */}
            {!isPaid && dueInfo && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  dueInfo.isOverdue
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                    : dueInfo.isDueSoon
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {dueInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Reference & Paid Details Drawer */}
        {isPaid ? (
          <div className="mt-3.5 pt-3 border-t border-emerald-100/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Hash className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-500 font-medium">Ref:</span>
              <span className="font-mono font-semibold text-slate-900">
                {payment.referenceNo || 'Pending Reference Log'}
              </span>
              {payment.referenceNo && (
                <button
                  type="button"
                  onClick={handleCopyRef}
                  title="Copy Reference Number"
                  className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  {copiedRef ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {payment.paidAt && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Paid on {payment.paidAt}</span>
              </div>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => onOpenEditModal(payment)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 ml-auto"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        ) : (
          isAdmin && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Installment is marked pending</span>
              <button
                type="button"
                onClick={() => onOpenEditModal(payment)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Set Ref / Mark Paid</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
