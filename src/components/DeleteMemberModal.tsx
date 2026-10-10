import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { MemberRegistration } from '../types';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: MemberRegistration | null;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  registration,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="bg-red-700 text-white p-4.5 flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-800 rounded-lg text-white">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-white">
              Delete Member Registration
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-800 text-xs sm:text-sm">
          <p className="text-stone-600 leading-relaxed">
            Are you sure you want to permanently delete registration <strong>Sl. No. #{registration.slNo}</strong> for applicant <strong>{registration.applicantName}</strong>?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold text-stone-500">Applicant:</span>
              <span className="font-bold text-stone-900">{registration.applicantName}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold text-stone-500">Mobile:</span>
              <span className="font-mono font-bold text-stone-900">+91 {registration.mobileNumber}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold text-stone-500">Total Persons:</span>
              <span className="font-bold text-red-700">{registration.totalPersons} Person(s)</span>
            </div>
            {registration.familyMembers && registration.familyMembers !== 'None' && (
              <div className="pt-1 border-t border-red-200/80">
                <span className="font-semibold text-stone-500 block mb-0.5">Accompanying Family:</span>
                <span className="text-stone-700 italic block">{registration.familyMembers}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-500">
            This action will remove the record from the Firebase database and update the active member count.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
