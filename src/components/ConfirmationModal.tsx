import React from 'react';
import { ShieldCheck, User, Users, Phone, X, CheckCircle, ArrowRight, Calendar, Database } from 'lucide-react';
import { ConsentFormData, VISIT_DATE } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: ConsentFormData;
  isSubmitting: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const validMembers = formData.familyMembers.filter(m => m.name.trim().length > 0);
  const accompanyingCount = validMembers.length;
  const totalPersons = 1 + accompanyingCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#991b1b] to-[#b91c1c] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400 rounded-lg text-red-900 shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-white leading-snug">
                Confirm Consent Registration
              </h3>
              <p className="text-xs text-red-100">
                Dhenkanal RS Sub Post Office • Visit Register
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Summary */}
        <div className="p-4 sm:p-6 space-y-4 text-stone-800">
          <p className="text-xs sm:text-sm text-stone-600">
            Please carefully review your consent details before final submission to the database.
          </p>

          <div className="bg-stone-50 rounded-xl p-3.5 sm:p-4 border border-stone-200 space-y-2.5 text-xs sm:text-sm">
            {/* Date of Visit */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 bg-amber-50/70 px-2 py-1 rounded-lg">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                Date of Visit:
              </span>
              <span className="font-extrabold text-red-700 bg-white px-2 py-0.5 rounded border border-amber-200 text-xs">
                {VISIT_DATE}
              </span>
            </div>

            {/* Applicant Name */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-200/70">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Applicant Name:
              </span>
              <span className="font-bold text-stone-900 text-right">
                {formData.applicantName}
              </span>
            </div>

            {/* Gender */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-200/70">
              <span className="text-xs font-semibold text-stone-500">Gender:</span>
              <span className="font-semibold text-stone-800">{formData.gender}</span>
            </div>

            {/* Age - DISPLAYED RIGHT AFTER GENDER */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-200/70">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Age:
              </span>
              <span className="font-mono font-bold text-stone-900">{formData.age} Years</span>
            </div>

            {/* Mobile Number */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-200/70">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                Mobile Number:
              </span>
              <span className="font-mono font-bold text-stone-900">
                +91 {formData.mobileNumber}
              </span>
            </div>

            {/* Accompanying Family Members Count */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-200/70">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                Accompanying Members:
              </span>
              <span className="font-bold text-red-700">
                {accompanyingCount} {accompanyingCount === 1 ? 'Person' : 'Persons'}
              </span>
            </div>

            {/* Total Persons */}
            <div className="flex items-center justify-between pt-1 text-xs sm:text-sm bg-red-50/70 p-2.5 rounded-lg border border-red-200/70">
              <span className="font-bold text-red-950">
                Total Persons Participating:
              </span>
              <span className="text-sm sm:text-base font-extrabold text-red-700 bg-white px-2.5 py-0.5 rounded border border-red-200 shadow-2xs">
                {totalPersons} {totalPersons === 1 ? 'Person' : 'Persons'}
              </span>
            </div>
          </div>

          {/* List of family members */}
          {validMembers.length > 0 && (
            <div className="text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="font-bold text-stone-700 block mb-1.5">
                Accompanying Family Members:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 font-medium pl-1">
                {validMembers.map((m) => (
                  <li key={m.id} className="truncate">
                    <span className="text-stone-900 font-semibold">{m.name}</span>
                    {(m.gender || m.age) && (
                      <span className="text-stone-500 text-[11px] ml-1.5 font-medium">
                        ({[m.gender, m.age ? `${m.age} yrs` : ''].filter(Boolean).join(', ')})
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Database Notice */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <Database className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">Data will be saved directly into Firebase Database.</span>
          </div>

          {/* Declaration */}
          <div className="flex items-start gap-2 pt-1 text-xs text-stone-500">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              By confirming, I give my formal consent to participate in the proposed Dhenkanal RS SO family visit program.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 bg-stone-100 border-t border-stone-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            Review & Edit
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Registration...</span>
              </>
            ) : (
              <>
                <span>Confirm & Submit Consent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
