import React from 'react';
import { AgreementMeta, PaymentItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CheckSquare, Square, Printer, CheckCircle } from 'lucide-react';

interface OfficialDocumentViewProps {
  meta: AgreementMeta;
  payments: PaymentItem[];
  onPrint: () => void;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({
  meta,
  payments,
  onPrint,
}) => {
  return (
    <div className="space-y-4">
      {/* Action Bar for the Document */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-sm font-bold">Official Document Preview</h2>
          <p className="text-xs text-slate-400">
            Formatted to match the official 1-page signed agreement.
          </p>
        </div>
        <button
          onClick={onPrint}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* The Printable Document Container */}
      <div className="print-container bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 text-slate-900 max-w-4xl mx-auto overflow-hidden">
        {/* Top Blue Accent Bar from PDF */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-600 to-blue-700 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-8" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {meta.subtitle}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DATE GENERATED
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono mt-0.5">
              {meta.dateGenerated}
            </p>
          </div>
        </div>

        {/* Agreement Summary Box (from PDF) */}
        <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-5 my-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PAYER
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {meta.payer}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              MONTHLY PAYMENT
            </span>
            <p className="text-sm font-bold text-sky-600 font-tabular mt-0.5">
              {formatCurrency(meta.monthlyPayment)} PHP
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              RECEIVER
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {meta.receiver}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DURATION
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {meta.duration}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PAYMENT METHOD
            </span>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-emerald-500 text-white inline-block">
                MAYA
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL AGREEMENT AMOUNT
            </span>
            <p className="text-sm font-bold text-slate-900 font-tabular mt-0.5">
              {formatCurrency(meta.totalAmount)} PHP
            </p>
          </div>
        </div>

        {/* Payment Breakdown Table */}
        <div className="my-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            PAYMENT BREAKDOWN
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                  <th className="py-2.5 px-4 font-semibold">DUE DATE</th>
                  <th className="py-2.5 px-4 font-semibold">AMOUNT DUE</th>
                  <th className="py-2.5 px-4 font-semibold">METHOD</th>
                  <th className="py-2.5 px-4 font-semibold text-right sm:text-left">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((p) => {
                  const isPaid = p.status === 'Paid';
                  return (
                    <tr key={p.id} className={isPaid ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {p.monthNum}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.dueDate}
                      </td>
                      <td className="py-3 px-4 font-tabular font-bold text-slate-800">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.method}
                      </td>
                      <td className="py-3 px-4 text-right sm:text-left">
                        <div className="inline-flex items-center gap-1.5">
                          {isPaid ? (
                            <>
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-emerald-700">Paid</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500">Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction & Reference Log Box (from PDF) */}
        <div className="my-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            TRANSACTION & REFERENCE LOG
          </h2>

          <div className="text-xs">
            <span className="text-slate-500 font-medium">Receiver Maya Mobile / Account No.: </span>
            <span className="font-mono font-bold text-slate-900 ml-1">
              {meta.receiverMayaNumber} ({meta.receiverMayaName})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 pt-2 border-t border-slate-100 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600 font-medium">Payment {p.monthNum} Ref:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {p.referenceNo || '___________________'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures Section (from PDF) */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
          <div className="space-y-1">
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic text-base sm:text-lg text-slate-700">
                Ramazan Delos Santos
              </span>
            </div>
            <div className="w-full border-t border-slate-900 pt-1.5">
              <p className="text-xs font-bold text-slate-900">{meta.payer}</p>
              <p className="text-[11px] text-slate-500">Payer Signature & Date · {meta.payerSignDate}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic text-base sm:text-lg text-slate-700">
                Sarah Martin
              </span>
            </div>
            <div className="w-full border-t border-slate-900 pt-1.5">
              <p className="text-xs font-bold text-slate-900">{meta.receiver}</p>
              <p className="text-[11px] text-slate-500">Receiver Signature & Date · {meta.receiverSignDate}</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note (from PDF) */}
        <div className="mt-12 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Payment Schedule & Agreement — Ramazan Delos Santos / Sarah Martin</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
