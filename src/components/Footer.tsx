import React from 'react';
import { Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { SPREADSHEET_URL } from '../data/backendCode';

interface FooterProps {
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onOpenSettings }) => {
  return (
    <footer className="mt-12 bg-stone-900 text-stone-300 border-t-4 border-red-700 text-xs py-8 px-4 no-print">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-800 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-700 text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-wide">
                DHENKANAL RS SUB POST OFFICE
              </p>
              <p className="text-[11px] text-stone-400">
                Odisha Postal Circle • Dhenkanal Postal Division • PIN: 759013
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={onOpenSettings}
              className="text-stone-300 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              Sheets Config
            </button>
            <span className="text-stone-700">•</span>
            <button
              onClick={onOpenGuide}
              className="text-stone-300 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              Deployment Instructions
            </button>
            <span className="text-stone-700">•</span>
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View Registry</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-[11px] text-center sm:text-left">
          {/* Prompt specified exact footer string */}
          <p className="font-semibold text-stone-400">
            Dhenkanal RS Sub Post Office – Consent Registration Form
          </p>
          <div className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Official Postal Department Agent Consent Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
