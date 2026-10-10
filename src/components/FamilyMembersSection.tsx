import React from 'react';
import { UserPlus, Trash2, Users, AlertCircle, Heart } from 'lucide-react';
import { FamilyMember, Gender } from '../types';

interface FamilyMembersSectionProps {
  familyMembers: FamilyMember[];
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => void;
  errors: { [key: number]: string };
}

export const FamilyMembersSection: React.FC<FamilyMembersSectionProps> = ({
  familyMembers,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  errors,
}) => {
  const accompanyingCount = familyMembers.length;
  const totalPersons = 1 + accompanyingCount;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-6 mb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
            2
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 truncate">
              Accompanying Family Members
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 truncate">
              List family members joining the visit
            </p>
          </div>
        </div>

        {/* Live Head Count Meter */}
        <div className="flex items-center gap-2 bg-red-50 border border-red-200/70 px-2.5 py-1 rounded-lg text-xs flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-red-600" />
          <span className="text-[11px] font-bold text-red-950">
            Total: <strong className="text-red-700 font-extrabold">{totalPersons}</strong>
          </span>
        </div>
      </div>

      {/* Dynamic Member List */}
      <div className="space-y-3.5">
        {familyMembers.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/60">
            <Heart className="w-7 h-7 text-stone-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-stone-700">
              No Accompanying Family Members Added
            </p>
            <p className="text-[11px] sm:text-xs text-stone-500 max-w-sm mx-auto mt-0.5 mb-3.5">
              Travelling alone? You can submit directly. If spouse, children, or family members will join you, tap below.
            </p>
            <button
              type="button"
              onClick={onAddMember}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Family Member</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map((member, index) => {
              const hasError = !!errors[index];
              return (
                <div
                  key={member.id}
                  className="p-3.5 sm:p-4 bg-stone-50/90 rounded-xl border border-stone-200 transition-all hover:border-stone-300 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-red-100 text-red-800 flex items-center justify-center font-bold text-[10px]">
                        #{index + 1}
                      </div>
                      <span className="text-xs font-bold text-stone-800">
                        Family Member #{index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Remove this member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Name Input */}
                    <div>
                      <label
                        htmlFor={`member-name-${member.id}`}
                        className="block text-xs font-semibold text-stone-700 mb-1"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`member-name-${member.id}`}
                        type="text"
                        autoCapitalize="words"
                        value={member.name}
                        onChange={(e) => onUpdateMember(member.id, { name: e.target.value })}
                        placeholder="e.g. Smt. Sunita Sahoo (Spouse)"
                        className={`w-full px-3 py-2.5 text-base sm:text-sm bg-white text-stone-900 rounded-xl border transition-all outline-none ${
                          hasError
                            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20'
                            : 'border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                        }`}
                      />
                    </div>

                    {/* Gender & Age row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Gender */}
                      <div>
                        <label
                          htmlFor={`member-gender-${member.id}`}
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`member-gender-${member.id}`}
                          value={member.gender || ''}
                          onChange={(e) => onUpdateMember(member.id, { gender: e.target.value as Gender })}
                          className="w-full px-2.5 py-2.5 text-base sm:text-sm bg-white text-stone-900 rounded-xl border border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
                        >
                          <option value="">-- Gender --</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div>
                        <label
                          htmlFor={`member-age-${member.id}`}
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Age (Years)
                        </label>
                        <input
                          id={`member-age-${member.id}`}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          value={member.age || ''}
                          onChange={(e) => {
                            const cleanAge = e.target.value.replace(/\D/g, '').slice(0, 3);
                            onUpdateMember(member.id, { age: cleanAge });
                          }}
                          placeholder="e.g. 34"
                          className="w-full px-2.5 py-2.5 text-base sm:text-sm bg-white text-stone-900 rounded-xl border border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {hasError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors[index]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Family Member Button */}
        {familyMembers.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onAddMember}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-red-50 text-stone-800 hover:text-red-700 border border-stone-300 hover:border-red-300 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>+ Add Another Family Member</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
