import React from 'react';
import { Lock, Unlock, Printer, Share2 } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onAdminToggle: () => void;
  onPrint: () => void;
  onShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onAdminToggle,
  onPrint,
  onShare,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-emerald-500/20">
            <span className="text-emerald-400">M</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              Payment Schedule
            </h1>
            <p className="text-[11px] text-slate-500 whitespace-nowrap hidden xs:block">
              Ramazan Delos Santos · Sarah Martin
            </p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Share Button */}
          <button
            onClick={onShare}
            aria-label="Share tracking summary"
            title="Share summary"
            className="h-10 w-10 sm:w-auto sm:px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all shadow-xs active:scale-95"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={onPrint}
            aria-label="Print or Save as PDF"
            title="Print or Save as PDF"
            className="h-10 w-10 sm:w-auto sm:px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Admin Switch / Status Button */}
          <button
            onClick={onAdminToggle}
            className={`h-10 px-3 sm:px-4 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-xs active:scale-95 ${
              isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            }`}
          >
            {isAdmin ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-200" />
                <span className="whitespace-nowrap">Admin Active</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-300" />
                <span className="whitespace-nowrap">Admin Access</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
