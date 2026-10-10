import React from 'react';
import { User, Phone, Hash, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Gender, FormErrors } from '../types';

interface ApplicantDetailsProps {
  applicantName: string;
  gender: Gender;
  age: string;
  mobileNumber: string;
  onNameChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onAgeChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  errors: FormErrors;
  nextSlNoPreview?: number | string;
}

export const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  applicantName,
  gender,
  age,
  mobileNumber,
  onNameChange,
  onGenderChange,
  onAgeChange,
  onMobileChange,
  errors,
  nextSlNoPreview,
}) => {
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    onMobileChange(cleaned);
  };

  const handleAgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    onAgeChange(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-6 mb-5">
      {/* Header with Title and Sl. No. */}
      <div className="flex items-center justify-between pb-3.5 mb-4 sm:mb-5 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
            1
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 truncate">
              Applicant (Postal Agent) Details
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 truncate">
              Dhenkanal RS Sub Post Office records
            </p>
          </div>
        </div>

        {/* Sl. No. badge */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex-shrink-0">
          <Hash className="w-3.5 h-3.5 text-red-600" />
          <div className="text-left">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 leading-none">
              Sl. No.
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-stone-800 leading-tight">
              {nextSlNoPreview ? `#${nextSlNoPreview}` : 'Auto'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Name of the Applicant */}
        <div>
          <label htmlFor="applicantName" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1">
            Name of the Applicant <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              autoComplete="name"
              autoCapitalize="words"
              value={applicantName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter postal agent's full name"
              className={`w-full pl-10 pr-4 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base sm:text-sm rounded-xl border transition-all outline-none ${
                errors.applicantName
                  ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                  : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              }`}
            />
          </div>
          {errors.applicantName && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.applicantName}
            </p>
          )}
        </div>

        {/* Gender, Age & Mobile Number Grid (Mobile-friendly stacked/grouped) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
          
          {/* Gender */}
          <div className="sm:col-span-4">
            <label htmlFor="gender" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1">
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => onGenderChange(e.target.value as Gender)}
              className={`w-full px-3.5 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base sm:text-sm rounded-xl border transition-all outline-none appearance-none cursor-pointer ${
                errors.gender
                  ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                  : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              }`}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.gender}
              </p>
            )}
          </div>

          {/* Age */}
          <div className="sm:col-span-3">
            <label htmlFor="age" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1">
              Age (Years) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="tel"
                id="age"
                name="age"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={age}
                onChange={handleAgeInput}
                placeholder="e.g. 38"
                className={`w-full pl-10 pr-3 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base sm:text-sm rounded-xl border font-mono transition-all outline-none ${
                  errors.age
                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                    : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                }`}
              />
            </div>
            {errors.age && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.age}
              </p>
            )}
          </div>

          {/* Mobile Number with 10-digit Indian validation */}
          <div className="sm:col-span-5">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="mobileNumber" className="block text-xs sm:text-sm font-bold text-stone-800">
                Mobile Number <span className="text-red-600">*</span>
              </label>
              <span className="text-[10px] font-mono font-semibold text-stone-400">
                {mobileNumber.length}/10 digits
              </span>
            </div>

            <div className="relative flex rounded-xl shadow-2xs">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-700 text-xs font-bold">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={handleMobileInput}
                placeholder="10-digit number"
                className={`flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-xl bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base sm:text-sm border font-mono transition-all outline-none ${
                  errors.mobileNumber
                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                    : isMobileValid
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                    : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                }`}
              />
              {isMobileValid && (
                <div className="absolute right-3 top-3.5 text-emerald-600 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {errors.mobileNumber ? (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.mobileNumber}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-stone-500">
                10 digits starting with 6, 7, 8, or 9
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
