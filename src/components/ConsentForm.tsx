import React from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Users, 
  UserPlus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  Hash, 
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { ConsentFormData, FormErrors, Gender, FamilyMember, VISIT_DATE } from '../types';

interface ConsentFormProps {
  formData: ConsentFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  nextSlNoPreview: number;
  onNameChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onAgeChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onAddFamilyMember: () => void;
  onRemoveFamilyMember: (id: string) => void;
  onUpdateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({
  formData,
  errors,
  isSubmitting,
  nextSlNoPreview,
  onNameChange,
  onGenderChange,
  onAgeChange,
  onMobileChange,
  onAddFamilyMember,
  onRemoveFamilyMember,
  onUpdateFamilyMember,
  onSubmit,
}) => {
  const isMobileValid = /^[6-9]\d{9}$/.test(formData.mobileNumber.trim());
  const totalHeadcount = 1 + formData.familyMembers.length;

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    onMobileChange(cleaned);
  };

  const handleAgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    onAgeChange(val);
  };

  return (
    <div className="space-y-4">
      {/* Official Instruction Notice with Date of Visit */}
      <div className="bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-stone-800 shadow-xs leading-relaxed">
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200 flex-wrap">
          <p className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>DHENKANAL RS SUB POST OFFICE • Official Notice</span>
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg shadow-2xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date of Visit: {VISIT_DATE}</span>
          </span>
        </div>
        <p className="text-stone-700">
          “Agents willing to participate in the proposed visit on <strong>{VISIT_DATE}</strong> with their family members are requested to fill in their details carefully. Add the names of all accompanying family members using the ‘+ Add Family Member’ button and click ‘Submit Consent’ to register your consent.”
        </p>
      </div>

      {/* Main Registration Form with Beautiful All-Side Border */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border-2 border-red-800/80 sm:border-red-900 overflow-hidden transition-all">
          
          {/* Form Header Banner with All-Side Framing */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-amber-400">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-amber-300 block">
                  DEPARTMENT OF POSTS • INDIA POST
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white font-serif">
                  Consent Registration Form
                </h3>
                <p className="text-[11px] text-red-100 mt-0.5">
                  Dhenkanal RS Sub Post Office Agents Family Visit Program
                </p>
              </div>

              {/* Sl. No. Preview Badge */}
              <div className="flex items-center gap-1.5 bg-amber-400 text-red-950 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs flex-shrink-0">
                <Hash className="w-4 h-4 text-red-900" />
                <div className="text-right">
                  <span className="block text-[8px] font-black uppercase tracking-wider text-red-900 leading-none">
                    Preview Sl. No.
                  </span>
                  <span className="text-xs sm:text-sm font-black text-red-950 font-mono leading-tight">
                    #{nextSlNoPreview}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Inner Container with Crisp Spacing & Borders */}
          <div className="p-4 sm:p-6 space-y-5 bg-white">
            
            {/* 1. Name of the Applicant */}
            <div className="space-y-1.5">
              <label htmlFor="applicantName" className="block text-xs sm:text-sm font-bold text-stone-800">
                Name of the Applicant (Postal Agent) <span className="text-red-600">*</span>
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
                  value={formData.applicantName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Enter postal agent's full name"
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base rounded-xl border-2 transition-all outline-none ${
                    errors.applicantName
                      ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                      : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                  }`}
                />
              </div>
              {errors.applicantName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.applicantName}</span>
                </p>
              )}
            </div>

            {/* 2. FAMILY MEMBERS SECTION - DIRECTLY BELOW APPLICANT NAME */}
            <div className="bg-stone-50/90 rounded-2xl p-3.5 sm:p-4 border-2 border-stone-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Accompanying Family Members
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-stone-500">
                      Add accompanying family members joining the visit
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-red-100 text-red-900 border border-red-200">
                  {formData.familyMembers.length} Added
                </span>
              </div>

              {/* List of dynamic members */}
              {formData.familyMembers.length === 0 ? (
                <div className="py-3 px-3 bg-white rounded-xl border-2 border-dashed border-stone-300 text-center">
                  <p className="text-xs text-stone-500">
                    No family members added yet. If family members are accompanying, click below:
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.familyMembers.map((member, index) => {
                    const memberError = errors.familyMembers?.[index];
                    return (
                      <div
                        key={member.id}
                        className="p-3 sm:p-3.5 bg-white rounded-xl border-2 border-stone-200 shadow-2xs space-y-2.5 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold text-[10px]">
                              {index + 1}
                            </span>
                            <span>Family Member #{index + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveFamilyMember(member.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Member Full Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Family Member Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            autoCapitalize="words"
                            onChange={(e) => onUpdateFamilyMember(member.id, { name: e.target.value })}
                            placeholder="e.g. Smt. Sunita Sahoo (Spouse)"
                            className={`w-full px-3 py-2 text-base sm:text-sm bg-stone-50/60 focus:bg-white text-stone-900 rounded-xl border-2 transition-all outline-none ${
                              memberError
                                ? 'border-red-500 ring-1 ring-red-200'
                                : 'border-stone-300 focus:border-red-600'
                            }`}
                          />
                          {memberError && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{memberError}</p>
                          )}
                        </div>

                        {/* Member Gender & Age Row */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Member Gender */}
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                              Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={member.gender || ''}
                              onChange={(e) => onUpdateFamilyMember(member.id, { gender: e.target.value as Gender })}
                              className="w-full px-2.5 py-2 text-base sm:text-sm bg-stone-50/60 focus:bg-white text-stone-900 rounded-xl border-2 border-stone-300 focus:border-red-600 outline-none cursor-pointer"
                            >
                              <option value="">-- Gender --</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Member Age */}
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                              Age (Years)
                            </label>
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={3}
                              value={member.age || ''}
                              onChange={(e) => {
                                const cleanAge = e.target.value.replace(/\D/g, '').slice(0, 3);
                                onUpdateFamilyMember(member.id, { age: cleanAge });
                              }}
                              placeholder="e.g. 32"
                              className="w-full px-2.5 py-2 text-base sm:text-sm bg-stone-50/60 focus:bg-white text-stone-900 rounded-xl border-2 border-stone-300 focus:border-red-600 outline-none font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Button to Add Family Member */}
              <button
                type="button"
                onClick={onAddFamilyMember}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-stone-100 text-red-700 border-2 border-red-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-red-600" />
                <span>{formData.familyMembers.length === 0 ? '+ Add Family Member' : '+ Add Another Family Member'}</span>
              </button>
            </div>

            {/* 3. Applicant Gender & Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Applicant Gender */}
              <div>
                <label htmlFor="gender" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                  Applicant Gender <span className="text-red-600">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => onGenderChange(e.target.value as Gender)}
                  className={`w-full px-3.5 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base rounded-xl border-2 transition-all outline-none cursor-pointer ${
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
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.gender}</span>
                  </p>
                )}
              </div>

              {/* Applicant Age */}
              <div>
                <label htmlFor="age" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                  Applicant Age (Years) <span className="text-red-600">*</span>
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
                    value={formData.age}
                    onChange={handleAgeInput}
                    placeholder="e.g. 38"
                    className={`w-full pl-10 pr-3 py-3 bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base rounded-xl border-2 font-mono transition-all outline-none ${
                      errors.age
                        ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                        : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                    }`}
                  />
                </div>
                {errors.age && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.age}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="mobileNumber" className="block text-xs sm:text-sm font-bold text-stone-800">
                  Mobile Number <span className="text-red-600">*</span>
                </label>
                <span className="text-[11px] font-mono font-semibold text-stone-400">
                  {formData.mobileNumber.length}/10 digits
                </span>
              </div>

              <div className="relative flex rounded-xl shadow-2xs">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border-2 border-r-0 border-stone-300 bg-stone-100 text-stone-700 text-xs font-bold">
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
                  value={formData.mobileNumber}
                  onChange={handleMobileInput}
                  placeholder="10-digit Indian mobile number"
                  className={`flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-xl bg-stone-50/80 hover:bg-stone-50 focus:bg-white text-stone-900 text-base border-2 font-mono transition-all outline-none ${
                    errors.mobileNumber
                      ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                      : isMobileValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                  }`}
                />
                {isMobileValid && (
                  <div className="absolute right-3 top-3.5 text-emerald-600 pointer-events-none">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              {errors.mobileNumber ? (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.mobileNumber}</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-stone-500">
                  Enter valid 10-digit mobile number starting with 6, 7, 8, or 9
                </p>
              )}
            </div>

            {/* 5. DATE OF VISIT: 06.12.2026 - PLACED DIRECTLY BELOW MOBILE NUMBER */}
            <div className="pt-1">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                Date of Visit (ପ୍ରସ୍ତାବିତ ଯାତ୍ରା ତାରିଖ) <span className="text-red-600">*</span>
              </label>
              
              <div className="bg-gradient-to-r from-red-50/90 via-amber-50/60 to-red-50/90 rounded-2xl p-3.5 sm:p-4 border-2 border-red-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-red-950 font-mono tracking-wide">
                          {VISIT_DATE}
                        </span>
                        <span className="text-xs font-bold text-red-800 bg-red-100/90 border border-red-200 px-2 py-0.5 rounded-md">
                          Sunday (ରବିବାର)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Official Scheduled Date for Dhenkanal RS SO Family Visit
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fixed Tour Date</span>
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 bg-white/80 rounded-lg p-2 border border-red-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                  <span>
                    Your consent registration will be officially logged for the tour on <strong>06.12.2026</strong>.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Form Bottom Submission Card - Unified inside the beautiful border frame */}
          <div className="bg-stone-50/90 border-t-2 border-stone-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm px-1">
              <div className="flex items-center gap-2 text-stone-600">
                <Users className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-stone-700">Total Persons Attending:</span>
              </div>
              <span className="font-black text-red-700 bg-red-50 border-2 border-red-200 px-3 py-1 rounded-xl text-sm">
                {totalHeadcount} Person(s)
              </span>
            </div>

            {/* Big Thumb-Friendly Direct Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-black text-base text-white shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting
                  ? 'bg-red-400 cursor-not-allowed opacity-80'
                  : 'bg-red-600 hover:bg-red-700 active:bg-red-800 border-b-2 border-red-950'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Consent</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dhenkanal RS Sub Post Office • Direct Database Registration</span>
            </p>
          </div>

        </div>
      </form>
    </div>
  );
};
