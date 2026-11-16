import React from 'react';
import { Calendar, Hash, FileText, Shield } from 'lucide-react';

export type TabType = 'schedule' | 'reference' | 'document';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  isAdmin: boolean;
  onAdminClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  isAdmin,
  onAdminClick,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-lg shadow-slate-900/5 no-print">
      <div className="grid grid-cols-4 items-center">
        {/* Tab 1: Schedule */}
        <button
          onClick={() => onChangeTab('schedule')}
          className={`min-h-[46px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'schedule'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentTab === 'schedule' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Schedule</span>
        </button>

        {/* Tab 2: Reference Log */}
        <button
          onClick={() => onChangeTab('reference')}
          className={`min-h-[46px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'reference'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hash className={`w-5 h-5 ${currentTab === 'reference' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Ref Log</span>
        </button>

        {/* Tab 3: Official PDF */}
        <button
          onClick={() => onChangeTab('document')}
          className={`min-h-[46px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'document'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className={`w-5 h-5 ${currentTab === 'document' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Official PDF</span>
        </button>

        {/* Tab 4: Admin Toggle */}
        <button
          onClick={onAdminClick}
          className={`min-h-[46px] flex flex-col items-center justify-center transition-colors ${
            isAdmin
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className={`w-5 h-5 ${isAdmin ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight">
            {isAdmin ? 'Admin On' : 'Admin'}
          </span>
        </button>
      </div>
    </nav>
  );
};
