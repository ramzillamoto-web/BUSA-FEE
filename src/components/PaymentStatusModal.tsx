import React, { useState, useEffect } from 'react';
import { PaymentItem } from '../types';
import { formatCurrency, getCurrentFormattedDateTime } from '../utils/formatters';
import { Check, X, Calendar, Hash, FileText, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentStatusModalProps {
  isOpen: boolean;
  payment: PaymentItem | null;
  onClose: () => void;
  onSave: (updated: PaymentItem) => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  payment,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [referenceNo, setReferenceNo] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (payment) {
      setStatus(payment.status);
      setReferenceNo(payment.referenceNo || '');
      setPaidAt(payment.paidAt || (payment.status === 'Paid' ? getCurrentFormattedDateTime() : ''));
      setNotes(payment.notes || '');
    }
  }, [payment, isOpen]);

  if (!isOpen || !payment) return null;

  const handleToggleStatus = (newStatus: 'Pending' | 'Paid') => {
    setStatus(newStatus);
    if (newStatus === 'Paid' && !paidAt) {
      setPaidAt(getCurrentFormattedDateTime());
    }
    if (newStatus === 'Paid' && !referenceNo) {
      // Auto-suggest a Maya reference format if blank
      const randomRef = 'MY' + Math.floor(100000000 + Math.random() * 900000000);
      setReferenceNo(randomRef);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: PaymentItem = {
      ...payment,
      status,
      referenceNo: referenceNo.trim(),
      paidAt: status === 'Paid' ? (paidAt.trim() || getCurrentFormattedDateTime()) : null,
      notes: notes.trim(),
    };

    if (status === 'Paid' && payment.status !== 'Paid') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#00D084', '#06b6d4', '#3b82f6', '#10b981'],
        });
      } catch (err) {
        console.warn('Confetti could not run', err);
      }
    }

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                #{payment.monthNum}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Payment #{payment.monthNum} Status
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Due Date: <span className="font-medium text-slate-700">{payment.dueDate}</span> · {formatCurrency(payment.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Status Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Payment Status (Admin Switch)
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleToggleStatus('Pending')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  status === 'Pending'
                    ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('Paid')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  status === 'Paid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Paid</span>
              </button>
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Maya Reference Number</span>
              </label>
              {status === 'Paid' && (
                <button
                  type="button"
                  onClick={() => {
                    const generated = 'MY' + Math.floor(100000000 + Math.random() * 900000000);
                    setReferenceNo(generated);
                  }}
                  className="text-[11px] text-emerald-600 hover:underline font-medium"
                >
                  Generate Maya Ref
                </button>
              )}
            </div>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. MY892348102 or Reference Code"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
            />
          </div>

          {/* Paid At Timestamp (if paid) */}
          {status === 'Paid' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment Date & Timestamp</span>
              </label>
              <input
                type="text"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                placeholder="e.g. Nov 18, 2026, 03:15 PM"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Remarks</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via Maya Mobile wallet"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
