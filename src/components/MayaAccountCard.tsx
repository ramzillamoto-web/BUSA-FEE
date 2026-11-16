import React, { useState } from 'react';
import { Copy, Check, Smartphone, Edit2, CheckCheck } from 'lucide-react';

interface MayaAccountCardProps {
  receiverName: string;
  mayaNumber: string;
  isAdmin: boolean;
  onUpdateMayaNumber: (newNumber: string) => void;
}

export const MayaAccountCard: React.FC<MayaAccountCardProps> = ({
  receiverName,
  mayaNumber,
  isAdmin,
  onUpdateMayaNumber,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(mayaNumber);

  const handleCopy = () => {
    navigator.clipboard.writeText(mayaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMayaNumber(editVal.trim());
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
      {/* Decorative Maya-inspired glow & shapes */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/25 text-emerald-200">
                Maya Official Receiver
              </span>
              <span className="text-xs text-emerald-100 font-medium">
                {receiverName}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="px-2.5 py-1 text-sm font-mono font-bold bg-white text-slate-900 rounded-lg focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 bg-white/20 text-white text-xs rounded-lg hover:bg-white/30"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg sm:text-xl font-bold font-mono tracking-wider">
                  {mayaNumber || '0917-882-9421'}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditVal(mayaNumber);
                      setIsEditing(true);
                    }}
                    title="Edit Receiver Maya Number"
                    className="p-1 hover:bg-white/20 rounded-md text-emerald-100 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            {copied ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-700" />
                <span>Copy Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
