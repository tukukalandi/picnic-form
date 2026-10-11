import React from 'react';
import { Mail, ShieldCheck, Lock, Unlock } from 'lucide-react';

interface FooterProps {
  onOpenAdminAuth: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminAuth, isAdmin }) => {
  return (
    <footer className="mt-10 bg-stone-900 text-stone-300 border-t-4 border-red-700 text-xs py-6 px-4 no-print">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-stone-800 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-700 text-amber-300 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wide">
                DHENKANAL RS SUB POST OFFICE
              </p>
              <p className="text-[10px] text-stone-400">
                Odisha Postal Circle • Dhenkanal Division • PIN: 759013
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={onOpenAdminAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition-colors border border-stone-700 cursor-pointer text-xs"
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Session Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-[10px] text-center sm:text-left">
          <p className="font-semibold text-stone-400">
            Dhenkanal RS Sub Post Office – Consent Registration Form
          </p>
          <div className="flex items-center gap-1 text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Firebase Firestore Database</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
