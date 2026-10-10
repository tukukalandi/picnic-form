import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  Calendar, 
  Users, 
  ShieldAlert 
} from 'lucide-react';
import { MemberRegistration, Gender, FamilyMember } from '../types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: MemberRegistration | null;
  onSave: (updated: MemberRegistration) => Promise<void>;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSave,
}) => {
  if (!isOpen || !registration) return null;

  // Initialize editable state
  const [applicantName, setApplicantName] = useState(registration.applicantName);
  const [gender, setGender] = useState<Gender>(registration.gender);
  const [age, setAge] = useState<string>(registration.age.toString());
  const [mobileNumber, setMobileNumber] = useState<string>(registration.mobileNumber);
  
  // Parse existing family members
  const parseInitialMembers = (): FamilyMember[] => {
    if (registration.familyMembersList && registration.familyMembersList.length > 0) {
      return registration.familyMembersList.map((m, idx) => ({
        id: `mem_edit_${idx}_${Date.now()}`,
        name: m.name,
        gender: m.gender || '',
        age: m.age || '',
      }));
    }

    if (!registration.familyMembers || registration.familyMembers === 'None') {
      return [];
    }

    return registration.familyMembers.split(',').map((item, idx) => {
      const trimmed = item.trim();
      // Match pattern like "Sunita Nayak (Female, 34 yrs)" or "Sunita (34 yrs)"
      let name = trimmed;
      let memberGender: Gender = '';
      let memberAge = '';

      const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        name = match[1].trim();
        const details = match[2];
        if (details.toLowerCase().includes('female')) memberGender = 'Female';
        else if (details.toLowerCase().includes('male')) memberGender = 'Male';
        else if (details.toLowerCase().includes('other')) memberGender = 'Other';

        const ageMatch = details.match(/(\d+)\s*(?:yrs|yr|years)?/i);
        if (ageMatch) memberAge = ageMatch[1];
      }

      return {
        id: `mem_edit_${idx}_${Date.now()}`,
        name,
        gender: memberGender,
        age: memberAge,
      };
    });
  };

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(parseInitialMembers);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAddMember = () => {
    setFamilyMembers(prev => [
      ...prev,
      { id: `mem_${Date.now()}_${Math.random()}`, name: '', gender: '', age: '' },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!applicantName.trim()) {
      newErrors.applicantName = 'Applicant name is required.';
    }
    if (!gender) {
      newErrors.gender = 'Gender is required.';
    }
    const ageNum = parseInt(age.trim(), 10);
    if (!age.trim() || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      newErrors.age = 'Valid age between 18 and 100 is required.';
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      newErrors.mobileNumber = 'Valid 10-digit Indian mobile number is required.';
    }

    familyMembers.forEach((m, idx) => {
      if (!m.name.trim()) {
        newErrors[`member_${idx}`] = 'Family member name cannot be empty.';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const cleanedMembers = familyMembers
        .map(m => {
          const parts = [];
          if (m.gender) parts.push(m.gender);
          if (m.age) parts.push(`${m.age} yrs`);
          const details = parts.length > 0 ? ` (${parts.join(', ')})` : '';
          return `${m.name.trim()}${details}`;
        })
        .filter(m => m.trim().length > 0);

      const formattedMembersString = cleanedMembers.length > 0 ? cleanedMembers.join(', ') : 'None';
      const totalPersons = 1 + familyMembers.length;

      const updatedRegistration: MemberRegistration = {
        ...registration,
        applicantName: applicantName.trim(),
        gender,
        age: ageNum,
        mobileNumber: mobileNumber.trim(),
        familyMembers: formattedMembersString,
        familyMembersList: familyMembers.map(m => ({
          name: m.name.trim(),
          gender: m.gender,
          age: m.age,
        })),
        totalPersons,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedRegistration);
      onClose();
    } catch (err) {
      console.error('Error saving updated member:', err);
      setErrors({ general: 'Failed to update record. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 transform transition-all flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        {/* Header */}
        <div className="bg-[#991b1b] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
              Admin Record Editor • Dhenkanal RS SO
            </span>
            <h3 id="edit-modal-title" className="text-base sm:text-lg font-bold">
              Edit Registration Details (Sl. No. #{registration.slNo})
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 sm:p-6 space-y-5 text-stone-800 text-xs sm:text-sm">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Section 1: Applicant Details */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-4">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-red-900">
              <User className="w-4 h-4" />
              <span>Applicant (Postal Agent) Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Applicant Name */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 rounded-lg border border-stone-300 focus:border-red-600 outline-none"
                />
                {errors.applicantName && (
                  <p className="mt-1 text-xs text-red-600">{errors.applicantName}</p>
                )}
              </div>

              {/* Gender */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white text-stone-900 rounded-lg border border-stone-300 focus:border-red-600 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                )}
              </div>

              {/* Age */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white text-stone-900 rounded-lg border border-stone-300 focus:border-red-600 outline-none font-mono text-center"
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-red-600">{errors.age}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 rounded-lg border border-stone-300 focus:border-red-600 outline-none font-mono"
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Family Members (Right Below Applicant Name & Details) */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-red-900">
                <Users className="w-4 h-4" />
                <span>Accompanying Family Members ({familyMembers.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Member</span>
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No accompanying family members listed for this applicant.
              </p>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-3 bg-white rounded-lg border border-stone-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-600">
                        Family Member #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                          placeholder="Member Full Name"
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 rounded border border-stone-300 focus:border-red-600 outline-none"
                        />
                        {errors[`member_${idx}`] && (
                          <p className="mt-1 text-[11px] text-red-600">{errors[`member_${idx}`]}</p>
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={member.gender || ''}
                          onChange={(e) => handleUpdateMember(member.id, { gender: e.target.value as Gender })}
                          className="w-full px-2 py-1.5 text-xs bg-stone-50 rounded border border-stone-300 focus:border-red-600 outline-none"
                        >
                          <option value="">Gender</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          maxLength={3}
                          value={member.age || ''}
                          onChange={(e) => handleUpdateMember(member.id, { age: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                          placeholder="Age (Yrs)"
                          className="w-full px-2 py-1.5 text-xs bg-stone-50 rounded border border-stone-300 focus:border-red-600 outline-none text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right text-xs font-semibold text-stone-600">
              Total Calculated Headcount: <strong className="text-red-700 font-bold">{1 + familyMembers.length} Person(s)</strong>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
