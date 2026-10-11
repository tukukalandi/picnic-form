import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Lock, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  ADMIN_EMAIL, 
  signInAdminWithGoogle, 
  signOutAdmin, 
  isUserAdmin 
} from '../lib/firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  isAdmin: boolean;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAdmin,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInAdminWithGoogle();
      if (!isUserAdmin(user)) {
        setErrorMessage(
          `Signed in as ${user.email}, but only ${ADMIN_EMAIL} is authorized to edit or delete applicant records.`
        );
      } else {
        setTimeout(() => onClose(), 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMessage('Google Sign-in failed: ' + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutAdmin();
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-auth-title"
      >
        {/* Header */}
        <div className="bg-[#991b1b] text-white p-4.5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-red-950 rounded-xl shadow-xs">
              <Lock className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 id="admin-auth-title" className="text-base font-bold text-white">
                Admin Authentication
              </h3>
              <p className="text-[11px] text-amber-200">
                Designated Administrator: {ADMIN_EMAIL}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-800 text-xs sm:text-sm">
          {/* Security policy note */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600 leading-relaxed">
            <span className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Strict Security Enforced</span>
            </span>
            Only the administrator (<strong>{ADMIN_EMAIL}</strong>) is authorized to edit or delete applicant details. All other users can only submit and view registrations.
          </div>

          {/* Current Status Card */}
          <div className={`p-4 rounded-xl border ${
            isAdmin
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : currentUser
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}>
            <div className="flex items-start gap-3">
              {isAdmin ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : currentUser ? (
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <UserCheck className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                  Current Session
                </span>
                {isAdmin ? (
                  <div>
                    <span className="text-sm font-black text-emerald-950 block">
                      Admin Access Active
                    </span>
                    <span className="text-xs text-emerald-800 font-mono">
                      {currentUser?.email}
                    </span>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      You have full authority to edit or delete registered members.
                    </p>
                  </div>
                ) : currentUser ? (
                  <div>
                    <span className="text-sm font-bold text-amber-950 block">
                      Non-Admin Account
                    </span>
                    <span className="text-xs text-amber-800 font-mono">
                      {currentUser.email}
                    </span>
                    <p className="mt-1 text-[11px] text-amber-700">
                      This email does not have admin permissions. Please sign in as <strong>{ADMIN_EMAIL}</strong>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-stone-800 block">
                      Not Signed In
                    </span>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Sign in with Google using <strong>{ADMIN_EMAIL}</strong> to unlock edit and delete controls.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-stone-100 hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Admin Mode</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign In with Google ({ADMIN_EMAIL})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
