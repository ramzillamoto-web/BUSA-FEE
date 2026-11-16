import React, { useState } from 'react';
import { PaymentItem, AgreementMeta } from '../types';
import { Copy, CheckCheck, Edit2, ShieldAlert, Check, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ReferenceLogViewProps {
  meta: AgreementMeta;
  payments: PaymentItem[];
  isAdmin: boolean;
  onUpdatePayment: (updated: PaymentItem) => void;
  onRequestAdmin: (desc: string) => void;
}

export const ReferenceLogView: React.FC<ReferenceLogViewProps> = ({
  meta,
  payments,
  isAdmin,
  onUpdatePayment,
  onRequestAdmin,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRefVal, setEditRefVal] = useState('');

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const startEdit = (p: PaymentItem) => {
    if (!isAdmin) {
      onRequestAdmin(`Edit Reference for Payment #${p.monthNum}`);
      return;
    }
    setEditingId(p.id);
    setEditRefVal(p.referenceNo || '');
  };

  const saveEdit = (p: PaymentItem) => {
    onUpdatePayment({
      ...p,
      referenceNo: editRefVal.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Transaction & Reference Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Maya reference codes corresponding to each monthly installment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
            {payments.filter((p) => p.status === 'Paid').length} of {payments.length} Logged
          </span>
        </div>
      </div>

      {/* Receiver Maya Mobile Line */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Receiver Maya Mobile / Account No.
          </span>
          <p className="text-base sm:text-lg font-mono font-bold text-slate-900 mt-0.5">
            {meta.receiverMayaNumber}
          </p>
          <p className="text-xs text-slate-500">Account Name: {meta.receiverMayaName}</p>
        </div>
        <button
          onClick={() => handleCopy(meta.receiverMayaNumber, 'receiver')}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-all"
        >
          {copiedKey === 'receiver' ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Account</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Reference Logs (2-column on desktop, matching PDF layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {payments.map((p) => {
          const isEditing = editingId === p.id;
          const isPaid = p.status === 'Paid';

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPaid
                  ? 'bg-emerald-50/30 border-emerald-200/70'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    #{p.monthNum}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Payment {p.monthNum} Ref:
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editRefVal}
                    onChange={(e) => setEditRefVal(e.target.value)}
                    placeholder="Enter Maya Ref No."
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(p)}
                    className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="min-w-0">
                    {p.referenceNo ? (
                      <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 tracking-wide break-all">
                        {p.referenceNo}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        No reference recorded yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {p.referenceNo && (
                      <button
                        onClick={() => handleCopy(p.referenceNo, `ref-${p.id}`)}
                        title="Copy Reference"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedKey === `ref-${p.id}` ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(p)}
                      title={isAdmin ? 'Edit reference' : 'Admin login required to edit'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Due: {p.dueDate}</span>
                <span className="font-tabular text-slate-600">{formatCurrency(p.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!isAdmin && (
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>Admin access is required to edit or log reference numbers.</span>
          </div>
          <button
            onClick={() => onRequestAdmin('Edit Reference Log')}
            className="font-semibold text-emerald-700 hover:underline shrink-0 ml-2"
          >
            Unlock Admin
          </button>
        </div>
      )}
    </div>
  );
};
