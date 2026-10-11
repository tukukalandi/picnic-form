import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  Phone, 
  Sparkles,
  Inbox,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
  ArrowUpDown,
  CornerDownRight,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, ADMIN_EMAIL } from '../lib/firebase';
import { MemberRegistration, SubmissionResult, VISIT_DATE } from '../types';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';

interface MembersDetailsPageProps {
  onNavigateToForm: () => void;
  onViewReceipt: (result: SubmissionResult) => void;
  isAdmin: boolean;
  currentUser: FirebaseUser | null;
  onOpenAdminAuth: () => void;
}

export const MembersDetailsPage: React.FC<MembersDetailsPageProps> = ({
  onNavigateToForm,
  onViewReceipt,
  isAdmin,
  currentUser,
  onOpenAdminAuth,
}) => {
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Edit & Delete Modals State
  const [editingMember, setEditingMember] = useState<MemberRegistration | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unauthorized Attempt Notice
  const [unauthorizedNotice, setUnauthorizedNotice] = useState<string | null>(null);

  // Real-time listener on Firestore 'registrations' collection
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const registrationsRef = collection(db, 'registrations');
    const q = query(registrationsRef, orderBy('slNo', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: MemberRegistration[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            slNo: data.slNo || 0,
            applicantName: data.applicantName || 'Unknown',
            gender: data.gender || '',
            age: data.age || 0,
            mobileNumber: data.mobileNumber || '',
            familyMembers: data.familyMembers || 'None',
            familyMembersList: data.familyMembersList,
            totalPersons: data.totalPersons || 1,
            submissionTime: data.submissionTime || '',
            dateOfVisit: data.dateOfVisit || VISIT_DATE,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setRegistrations(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
        setError('Unable to load member registrations from Firebase Firestore.');
        setIsLoading(false);
        try {
          handleFirestoreError(err, OperationType.GET, 'registrations');
        } catch {
          // Handled
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter & Search Logic
  const filteredRegistrations = registrations
    .filter((reg) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        reg.applicantName.toLowerCase().includes(q) ||
        reg.mobileNumber.includes(q) ||
        reg.familyMembers.toLowerCase().includes(q) ||
        reg.slNo.toString().includes(q);

      const matchGender =
        genderFilter === 'All' || reg.gender.toLowerCase() === genderFilter.toLowerCase();

      return matchSearch && matchGender;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.slNo - b.slNo;
      }
      return b.slNo - a.slNo;
    });

  // KPI Computations
  const totalAgents = registrations.length;
  const totalHeadcount = registrations.reduce((sum, r) => sum + (r.totalPersons || 1), 0);
  const totalFamilyMembers = Math.max(0, totalHeadcount - totalAgents);

  // Helper to parse family members string into list of items with gender & age
  const parseFamilyMembersDisplay = (reg: MemberRegistration) => {
    if (reg.familyMembersList && reg.familyMembersList.length > 0) {
      return reg.familyMembersList;
    }
    if (!reg.familyMembers || reg.familyMembers === 'None') {
      return [];
    }
    return reg.familyMembers.split(',').map((item) => {
      const trimmed = item.trim();
      let name = trimmed;
      let gender = '';
      let age = '';

      const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        name = match[1].trim();
        const details = match[2];
        if (details.toLowerCase().includes('female')) gender = 'Female';
        else if (details.toLowerCase().includes('male')) gender = 'Male';
        else if (details.toLowerCase().includes('other')) gender = 'Other';

        const ageMatch = details.match(/(\d+)\s*(?:yrs|yr|years)?/i);
        if (ageMatch) age = ageMatch[1];
      }

      return { name, gender, age };
    });
  };

  // Safe Admin Edit Handler
  const handleRequestEdit = (reg: MemberRegistration) => {
    if (!isAdmin) {
      setUnauthorizedNotice(`Only administrator (${ADMIN_EMAIL}) is permitted to edit applicant details. Please sign in as admin.`);
      onOpenAdminAuth();
      return;
    }
    setEditingMember(reg);
  };

  // Safe Admin Delete Handler
  const handleRequestDelete = (reg: MemberRegistration) => {
    if (!isAdmin) {
      setUnauthorizedNotice(`Only administrator (${ADMIN_EMAIL}) is permitted to delete applicant details. Please sign in as admin.`);
      onOpenAdminAuth();
      return;
    }
    setDeletingMember(reg);
  };

  // Handle Edit Save (Enforced Admin Only)
  const handleSaveEdit = async (updated: MemberRegistration) => {
    if (!isAdmin) {
      setActionFeedback({
        message: `Unauthorized: Only ${ADMIN_EMAIL} can edit records.`,
        type: 'error',
      });
      return;
    }

    try {
      const regDocRef = doc(db, 'registrations', updated.id);
      await updateDoc(regDocRef, {
        applicantName: updated.applicantName,
        gender: updated.gender,
        age: updated.age,
        mobileNumber: updated.mobileNumber,
        familyMembers: updated.familyMembers,
        familyMembersList: updated.familyMembersList || [],
        totalPersons: updated.totalPersons,
        updatedAt: new Date().toISOString(),
      });

      setActionFeedback({
        message: `Successfully updated registration for ${updated.applicantName}.`,
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error('Update doc error:', err);
      setActionFeedback({
        message: 'Failed to update record in database. Please verify permissions.',
        type: 'error',
      });
      throw err;
    }
  };

  // Handle Delete Confirmation (Enforced Admin Only)
  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    if (!isAdmin) {
      setActionFeedback({
        message: `Unauthorized: Only ${ADMIN_EMAIL} can delete records.`,
        type: 'error',
      });
      setDeletingMember(null);
      return;
    }

    setIsDeleting(true);
    try {
      const regDocRef = doc(db, 'registrations', deletingMember.id);
      await deleteDoc(regDocRef);

      setActionFeedback({
        message: `Registration Sl. No. #${deletingMember.slNo} (${deletingMember.applicantName}) has been deleted.`,
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 3500);
      setDeletingMember(null);
    } catch (err) {
      console.error('Delete doc error:', err);
      setActionFeedback({
        message: 'Failed to delete record. Please verify admin permissions.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'Sl. No.',
      'Applicant Name',
      'Applicant Gender',
      'Applicant Age',
      'Mobile Number',
      'Accompanying Family Members (with Gender & Age)',
      'Total Persons',
      'Submission Date & Time',
    ];

    const rows = filteredRegistrations.map((r) => [
      r.slNo,
      `"${r.applicantName.replace(/"/g, '""')}"`,
      r.gender,
      r.age,
      `'${r.mobileNumber}`,
      `"${r.familyMembers.replace(/"/g, '""')}"`,
      r.totalPersons,
      `"${r.submissionTime.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dhenkanal_RS_SO_Visit_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-700" />
                  <span>Admin Mode Active ({currentUser?.email})</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-100 text-stone-700 border border-stone-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-500" />
                  <span>View Only Mode</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firebase Real-time Sync</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                Members Details & Registration Register
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-red-600 text-white shadow-2xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date of Visit: {VISIT_DATE}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Dhenkanal RS Sub Post Office • Registered postal agents and accompanying family members for visit on {VISIT_DATE}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isAdmin ? (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Sign in with authorized Google account"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Manage Admin Session"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={registrations.length === 0}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToForm}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register</span>
            </button>
          </div>
        </div>

        {/* Security Info Banner */}
        <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
          isAdmin
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${isAdmin ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>
              {isAdmin ? (
                <>Authorized administrator logged in (<strong>{ADMIN_EMAIL}</strong>). You can edit or delete applicant details.</>
              ) : (
                <>Only the administrator (<strong>{ADMIN_EMAIL}</strong>) can edit or delete applicant details. All other members can only view records.</>
              )}
            </span>
          </div>
          {!isAdmin && (
            <button
              onClick={onOpenAdminAuth}
              className="font-bold underline text-amber-800 hover:text-amber-950 flex-shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mt-3 p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-5">
          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Postal Agents Registered
              </span>
              <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono">
                {totalAgents}
              </span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Accompanying Family Members
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
                {totalFamilyMembers}
              </span>
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-red-800 block">
                Grand Total Headcount
              </span>
              <span className="text-xl sm:text-2xl font-black text-red-900 font-mono">
                {totalHeadcount} <span className="text-xs font-semibold text-red-700">Persons</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agent, family member, mobile..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 focus:bg-white text-stone-900 text-xs rounded-xl border border-stone-300 focus:border-red-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 outline-none focus:border-red-600"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
            title="Sort by Serial Number"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
            <span>Sl. No: {sortOrder === 'asc' ? '1 → N' : 'N → 1'}</span>
          </button>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-stone-300 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-800">
            Fetching registered members from Firebase Firestore...
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Loading real-time consent submissions for Dhenkanal RS SO
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-900">
          <p className="font-bold text-sm">{error}</p>
          <p className="text-xs text-red-700 mt-1">
            Check your Firebase Firestore configuration in <code>firebase-applet-config.json</code>.
          </p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            {searchQuery || genderFilter !== 'All' ? 'No Matching Members Found' : 'No Registrations Submitted Yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
            {searchQuery || genderFilter !== 'All'
              ? 'Try adjusting your search criteria or gender filter to locate registered participants.'
              : 'Registered postal agents and their accompanying family members will appear in this registry in real-time.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Open Registration Form</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW - FAMILY MEMBERS DISPLAYED DIRECTLY BELOW APPLICANT NAME */
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800 border-collapse">
              <thead className="bg-[#991b1b] text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-3.5 py-3 text-center w-16">Sl. No.</th>
                  <th className="px-4 py-3 min-w-[280px]">Applicant & Accompanying Family Members</th>
                  <th className="px-3 py-3 text-center">Age</th>
                  <th className="px-3.5 py-3">Mobile Number</th>
                  <th className="px-3 py-3 text-center">Headcount</th>
                  <th className="px-3.5 py-3">Submission Time</th>
                  <th className="px-3.5 py-3 text-center min-w-[130px]">
                    {isAdmin ? 'Admin Actions' : 'Access'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredRegistrations.map((reg, idx) => {
                  const familyList = parseFamilyMembersDisplay(reg);
                  return (
                    <tr
                      key={reg.id}
                      className={`hover:bg-red-50/40 transition-colors align-top ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                      }`}
                    >
                      {/* Sl. No. */}
                      <td className="px-3.5 py-3.5 text-center font-bold text-red-900 font-mono bg-stone-100/60">
                        #{reg.slNo}
                      </td>

                      {/* Applicant Name AND FAMILY MEMBERS BELOW IT */}
                      <td className="px-4 py-3.5">
                        {/* Primary Applicant Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-stone-900 text-sm">
                            {reg.applicantName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              reg.gender === 'Male'
                                ? 'bg-blue-50 text-blue-700'
                                : reg.gender === 'Female'
                                ? 'bg-pink-50 text-pink-700'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {reg.gender}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono font-semibold">
                            ({reg.age} yrs)
                          </span>
                        </div>

                        {/* FAMILY MEMBERS PLACED DIRECTLY BELOW APPLICANT NAME */}
                        <div className="mt-2 pl-2.5 border-l-2 border-red-300 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-red-600" />
                            <span>Family Members ({familyList.length}):</span>
                          </span>

                          {familyList.length > 0 ? (
                            <div className="space-y-1 pt-0.5">
                              {familyList.map((m, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="flex items-center gap-2 text-xs bg-stone-100/80 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/60"
                                >
                                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                                    {mIdx + 1}
                                  </span>
                                  <span className="font-bold text-stone-800">{m.name}</span>
                                  {m.gender && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                        m.gender === 'Female'
                                          ? 'bg-pink-100 text-pink-800'
                                          : m.gender === 'Male'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-stone-200 text-stone-800'
                                      }`}
                                    >
                                      {m.gender}
                                    </span>
                                  )}
                                  {m.age && (
                                    <span className="text-[10px] text-stone-500 font-mono">
                                      {m.age} yrs
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-stone-400 italic">
                              No accompanying members (Travelling solo)
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Applicant Age */}
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-stone-800">
                        {reg.age}
                      </td>

                      {/* Mobile */}
                      <td className="px-3.5 py-3.5 font-mono">
                        <a
                          href={`tel:+91${reg.mobileNumber}`}
                          className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 font-bold hover:underline"
                          title="Click to dial"
                        >
                          <Phone className="w-3 h-3 text-red-600" />
                          <span>+91 {reg.mobileNumber}</span>
                        </a>
                      </td>

                      {/* Headcount */}
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-block px-2.5 py-1 bg-red-100 text-red-900 rounded-lg font-extrabold text-xs border border-red-200 shadow-2xs">
                          {reg.totalPersons}
                        </span>
                        <span className="block text-[10px] text-stone-400 mt-0.5">Person(s)</span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-3.5 py-3.5 text-stone-500 text-[11px] whitespace-nowrap">
                        {reg.submissionTime}
                        {reg.updatedAt && (
                          <span className="block text-[9px] text-amber-700 font-semibold mt-0.5">
                            (Edited)
                          </span>
                        )}
                      </td>

                      {/* Admin Actions: Edit, Delete, View Slip */}
                      <td className="px-3.5 py-3.5 text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button (Admin Authorized) */}
                            <button
                              type="button"
                              onClick={() => handleRequestEdit(reg)}
                              className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Member Details (Admin)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Button (Admin Authorized) */}
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(reg)}
                              className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete Member Registration (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          /* Non-Admin Locked Indicator */
                          <div className="flex flex-col items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRequestEdit(reg)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-stone-700 px-2 py-1 bg-stone-100 rounded-md transition-colors cursor-pointer"
                              title={`Only ${ADMIN_EMAIL} can edit or delete`}
                            >
                              <Lock className="w-3 h-3 text-stone-400" />
                              <span>Admin Only</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW - FULLY OPTIMIZED FOR MOBILE SCREENS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegistrations.map((reg) => {
            const familyList = parseFamilyMembersDisplay(reg);
            return (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all"
              >
                <div>
                  {/* Card Header: Sl. No. and Headcount */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-red-100 text-red-900 font-mono font-black rounded-lg text-xs border border-red-200">
                        #{reg.slNo}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-base leading-tight">
                          {reg.applicantName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          <span>{reg.gender}</span>
                          <span>•</span>
                          <span className="font-mono font-semibold">{reg.age} Years</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 font-extrabold rounded-lg text-xs border border-red-200 inline-block">
                        {reg.totalPersons} Person(s)
                      </span>
                    </div>
                  </div>

                  {/* Accompanying Family Members Placed Directly Below Applicant Name */}
                  <div className="mt-3.5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-red-600" />
                      <span>Accompanying Family Members ({familyList.length}):</span>
                    </span>

                    {familyList.length > 0 ? (
                      <div className="space-y-1.5 pl-2 border-l-2 border-red-200">
                        {familyList.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center justify-between text-xs bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/60"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                                {mIdx + 1}
                              </span>
                              <span className="font-bold text-stone-800 truncate">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {m.gender && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  m.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {m.gender}
                                </span>
                              )}
                              {m.age && (
                                <span className="text-[10px] text-stone-500 font-mono">
                                  {m.age} yrs
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic pl-2 border-l-2 border-stone-200">
                        Solo participation (No family members accompanying)
                      </p>
                    )}
                  </div>

                  {/* Mobile & Timestamp details */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <a
                      href={`tel:+91${reg.mobileNumber}`}
                      className="font-mono font-bold text-red-700 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <span>+91 {reg.mobileNumber}</span>
                    </a>
                    <span className="text-[11px] text-stone-400">
                      {reg.submissionTime}
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  {isAdmin ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => handleRequestEdit(reg)}
                        className="flex-1 py-2 px-3 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestDelete(reg)}
                        className="py-2 px-3 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-[11px] text-stone-400 px-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-stone-400" />
                        <span>Admin ({ADMIN_EMAIL}) only can edit or delete</span>
                      </span>
                      <button
                        type="button"
                        onClick={onOpenAdminAuth}
                        className="text-amber-800 font-bold hover:underline cursor-pointer"
                      >
                        Admin Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          registration={editingMember}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMember && (
        <DeleteMemberModal
          isOpen={Boolean(deletingMember)}
          onClose={() => setDeletingMember(null)}
          registration={deletingMember}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
