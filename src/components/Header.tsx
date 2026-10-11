import { Mail, ShieldCheck, FileText, Users, Lock, Unlock, Database, Calendar } from 'lucide-react';
import { User } from 'firebase/auth';
import { VISIT_DATE } from '../types';

interface HeaderProps {
  activeTab: 'form' | 'members';
  onTabChange: (tab: 'form' | 'members') => void;
  onOpenAdminAuth: () => void;
  isAdmin: boolean;
  currentUser: User | null;
  memberCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAdminAuth,
  isAdmin,
  currentUser,
  memberCount = 0,
}) => {
  return (
    <header className="relative bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#991b1b] text-white shadow-md border-b-4 border-amber-400 no-print">
      {/* Micro-bar for postal credentials */}
      <div className="bg-[#7f1d1d] text-amber-200 text-[11px] px-3 sm:px-4 py-1 flex items-center justify-between border-b border-red-800/60 font-medium">
        <div className="flex items-center space-x-1.5 truncate">
          <span>भारत सरकार • डाक विभाग</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Department of Posts</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs">
          <span className="text-amber-100">Dhenkanal RS SO (759013)</span>
          <div className="flex items-center gap-1 bg-red-950/70 px-2 py-0.5 rounded text-amber-300">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Firebase</span>
          </div>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* India Post Emblem */}
            <div className="relative flex-shrink-0 w-11 h-11 sm:w-13 sm:h-13 bg-amber-400 rounded-xl p-1 shadow-sm flex items-center justify-center border-2 border-amber-200 text-red-900">
              <div className="w-full h-full border border-dashed border-red-800/60 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500">
                <Mail className="w-5 h-5 text-red-900 stroke-[2.2]" />
                <span className="text-[7px] font-black tracking-widest text-red-950 uppercase mt-0.5">INDIA POST</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-red-700 text-white rounded-full p-0.5 shadow">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
            </div>

            {/* Titles */}
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-amber-300 truncate">
                Sub Post Office • Dhenkanal R.S.
              </div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white leading-tight font-serif truncate">
                DHENKANAL RS SUB POST OFFICE
              </h1>
              <h2 className="text-[11px] sm:text-xs font-medium text-red-100 mt-0.5 truncate">
                Family Visit – Consent & Registration Portal
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-red-950 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black shadow-2xs mt-1.5 border border-amber-300">
                <Calendar className="w-3 h-3 text-red-900" />
                <span>Date of Visit: {VISIT_DATE}</span>
              </div>
            </div>
          </div>

          {/* Admin Login / Auth Status Pill */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={onOpenAdminAuth}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-300'
                  : 'bg-red-800/80 hover:bg-red-900 text-red-100 border border-red-600/60'
              }`}
              title={isAdmin ? `Admin mode active (${currentUser?.email})` : 'Admin sign-in to edit/delete records'}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Primary Page Navigation Tabs */}
        <div className="mt-3 pt-2.5 border-t border-red-800/70 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTabChange('form')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-red-900 shadow-md ring-2 ring-amber-400'
                : 'bg-red-800/50 text-red-100 hover:bg-red-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registration Form</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('members')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white text-red-900 shadow-md ring-2 ring-amber-400'
                : 'bg-red-800/50 text-red-100 hover:bg-red-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members Details</span>
            {memberCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'members' ? 'bg-red-700 text-white' : 'bg-amber-400 text-red-950'
              }`}>
                {memberCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
