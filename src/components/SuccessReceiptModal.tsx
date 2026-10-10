import React from 'react';
import { CheckCircle2, Printer, ExternalLink, RefreshCw, FileText, Stamp, Sparkles, Check } from 'lucide-react';
import { SubmissionResult } from '../types';
import { SPREADSHEET_URL } from '../data/backendCode';

interface SuccessReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SubmissionResult | null;
  onResetForm: () => void;
  onViewMembersList?: () => void;
}

export const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  isOpen,
  onClose,
  result,
  onResetForm,
  onViewMembersList,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white p-5 sm:p-6 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white/10">
            <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          
          <h2 id="success-modal-title" className="text-lg sm:text-xl font-extrabold tracking-tight">
            Consent Registered Successfully!
          </h2>
          
          {/* Exact required sentence */}
          <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-100 max-w-md mx-auto leading-relaxed">
            “Your consent and participant details have been submitted successfully.”
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/20">
            {result.isMock ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Local Preview Mode (Connect Apps Script to persist)</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Successfully Written to Google Spreadsheet!</span>
              </>
            )}
          </div>
        </div>

        {/* Official Printable Postal Receipt Slip */}
        <div className="p-5 sm:p-6">
          <div 
            id="printable-receipt"
            className="border-2 border-dashed border-red-300 rounded-xl p-5 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden shadow-xs"
          >
            {/* Postal Watermark stamp */}
            <div className="absolute right-3 top-3 opacity-15 pointer-events-none transform rotate-12 flex flex-col items-center border-2 border-red-800 rounded-full w-24 h-24 justify-center text-center p-1">
              <span className="text-[8px] font-black tracking-widest text-red-900 uppercase">DHENKANAL RS SO</span>
              <Stamp className="w-5 h-5 text-red-900 my-0.5" />
              <span className="text-[7px] font-bold text-red-900">759013 • REGISTERED</span>
            </div>

            {/* Receipt Header */}
            <div className="border-b border-stone-200 pb-3 mb-4 text-center">
              <span className="text-[10px] font-extrabold tracking-widest text-red-800 uppercase block">
                DEPARTMENT OF POSTS • INDIA POST
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 font-serif">
                DHENKANAL RS SUB POST OFFICE
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Family Visit – Official Registration Acknowledgment Slip
              </p>
            </div>

            {/* Serial Number Showcase */}
            <div className="bg-red-50 border border-red-200/80 rounded-lg p-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                  Registered Serial Number
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-900 font-mono tracking-tight">
                  Sl. No. {result.slNo}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-stone-500 block">Date & Time</span>
                <span className="text-xs font-bold text-stone-700 block">{result.submissionTime}</span>
              </div>
            </div>

            {/* Data Details Grid - AGE DISPLAYED RIGHT AFTER GENDER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
              <div className="p-2 bg-white rounded border border-stone-100 col-span-2">
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Applicant Name</span>
                <span className="font-bold text-stone-800 text-sm truncate block">{result.applicantName}</span>
              </div>

              <div className="p-2 bg-white rounded border border-stone-100">
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Gender</span>
                <span className="font-bold text-stone-800">{result.gender}</span>
              </div>

              <div className="p-2 bg-white rounded border border-stone-100">
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Age</span>
                <span className="font-bold text-stone-800 font-mono">{result.age} Yrs</span>
              </div>

              <div className="p-2 bg-white rounded border border-stone-100 col-span-2">
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Mobile Number</span>
                <span className="font-mono font-bold text-stone-800">+91 {result.mobileNumber}</span>
              </div>

              <div className="p-2 bg-red-50/50 rounded border border-red-100 col-span-2">
                <span className="text-red-700 font-semibold block text-[10px] uppercase">Total Persons</span>
                <span className="font-extrabold text-red-700 text-sm">
                  {result.totalPersons} {result.totalPersons === 1 ? 'Person' : 'Persons'}
                </span>
              </div>
            </div>

            {/* Accompanying Members Breakdown */}
            <div className="bg-white p-3 rounded border border-stone-200 text-xs">
              <span className="text-stone-500 font-bold block mb-1 text-[11px]">
                Accompanying Family Members ({result.familyMembers.length}):
              </span>
              {result.familyMembers.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-stone-700 font-medium">
                  {result.familyMembers.map((name, i) => (
                    <li key={i} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-stone-400 italic">No accompanying members listed (Travelling solo)</span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-400">
              <span>Post Office: Dhenkanal RS SO (759013)</span>
              <span>Computer Generated Slip</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Verify in Google Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetForm}
              className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Submit Another</span>
            </button>

            {onViewMembersList && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewMembersList();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>View in Members Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
