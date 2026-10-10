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
  Eye, 
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
  CornerDownRight
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MemberRegistration, SubmissionResult } from '../types';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';

interface MembersDetailsPageProps {
  onNavigateToForm: () => void;
  onViewReceipt: (result: SubmissionResult) => void;
}

export const MembersDetailsPage: React.FC<MembersDetailsPageProps> = ({
  onNavigateToForm,
  onViewReceipt,
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

  // Handle Edit Save
  const handleSaveEdit = async (updated: MemberRegistration) => {
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
        message: 'Failed to update record in database. Please try again.',
        type: 'error',
      });
      throw err;
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
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
        message: 'Failed to delete record. Please try again.',
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
    link.setAttribute('download', `Dhenkanal_RS_SO_Visit_Members_Admin_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-900 border border-red-200">
                Admin Management Console
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Real-time Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              Members Details & Registration Register
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Dhenkanal RS Sub Post Office • Manage, edit, or delete registered postal agents and accompanying family members
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={registrations.length === 0}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Print Register</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToForm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register New Agent</span>
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
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
              className="text-stone-400 hover:text-stone-600"
            >
              &times;
            </button>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Postal Agents Registered
              </span>
              <span className="text-2xl font-black text-stone-900 font-mono">
                {totalAgents}
              </span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Accompanying Family Members
              </span>
              <span className="text-2xl font-black text-amber-900 font-mono">
                {totalFamilyMembers}
              </span>
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-800 block">
                Grand Total Persons
              </span>
              <span className="text-2xl font-black text-red-900 font-mono">
                {totalHeadcount} <span className="text-xs font-semibold text-red-700">Attending</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agent, family member, mobile..."
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50 focus:bg-white text-stone-900 text-xs rounded-lg border border-stone-300 focus:border-red-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 outline-none focus:border-red-600"
            >
              <option value="All">All Applicant Genders</option>
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
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Cards View
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
                  <th className="px-3.5 py-3 text-center min-w-[120px]">Admin Actions</th>
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
                        <div className="flex items-center gap-2">
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
                        <div className="mt-2 pl-2 border-l-2 border-red-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-red-600" />
                            <span>Accompanying Family Members ({familyList.length}):</span>
                          </span>

                          {familyList.length > 0 ? (
                            <div className="space-y-1 pt-0.5">
                              {familyList.map((m, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="flex items-center gap-2 text-xs bg-stone-100/70 hover:bg-stone-100 px-2 py-1 rounded border border-stone-200/60"
                                >
                                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] flex items-center justify-center font-bold">
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
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingMember(reg)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Member Details (Admin)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingMember(reg)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Member Registration (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* View Slip */}
                          <button
                            type="button"
                            onClick={() =>
                              onViewReceipt({
                                slNo: reg.slNo,
                                applicantName: reg.applicantName,
                                gender: reg.gender,
                                age: reg.age.toString(),
                                mobileNumber: reg.mobileNumber,
                                familyMembers:
                                  reg.familyMembers && reg.familyMembers !== 'None'
                                    ? reg.familyMembers.split(',').map((s) => s.trim())
                                    : [],
                                totalPersons: reg.totalPersons,
                                submissionTime: reg.submissionTime,
                                firestoreId: reg.id,
                                isMock: false,
                              })
                            }
                            className="p-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="View Official Postal Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>Showing {filteredRegistrations.length} of {registrations.length} registered submissions</span>
            <span className="text-[11px] font-semibold text-stone-600">
              Admin privileges active • Real-time editing and deletion enabled
            </span>
          </div>
        </div>
      ) : (
        /* CARDS VIEW - FAMILY MEMBERS DISPLAYED DIRECTLY BELOW APPLICANT NAME */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegistrations.map((reg) => {
            const familyList = parseFamilyMembersDisplay(reg);
            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl shadow-xs border border-stone-200 p-4.5 hover:border-red-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-100">
                    <div>
                      <span className="text-xs font-black text-red-900 font-mono bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Sl. No. #{reg.slNo}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-base mt-1.5">
                        {reg.applicantName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">{reg.gender}</span>
                        <span>&bull;</span>
                        <span className="font-mono font-semibold">{reg.age} Yrs</span>
                        <span>&bull;</span>
                        <a href={`tel:+91${reg.mobileNumber}`} className="font-mono text-red-700 font-bold">
                          +91 {reg.mobileNumber}
                        </a>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-stone-400">Headcount</span>
                      <span className="text-sm font-extrabold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        {reg.totalPersons} Person(s)
                      </span>
                    </div>
                  </div>

                  {/* FAMILY MEMBERS PLACED DIRECTLY BELOW APPLICANT NAME */}
                  <div className="pt-3 pb-2">
                    <span className="text-[11px] uppercase font-bold text-stone-500 block mb-1.5">
                      Accompanying Family Members ({familyList.length}):
                    </span>
                    {familyList.length > 0 ? (
                      <div className="space-y-1.5">
                        {familyList.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center justify-between text-xs bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/70"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] flex items-center justify-center font-bold">
                                {mIdx + 1}
                              </span>
                              <span className="font-bold text-stone-800">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic">None (Travelling solo)</p>
                    )}
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">{reg.submissionTime}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingMember(reg)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingMember(reg)}
                      className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onViewReceipt({
                          slNo: reg.slNo,
                          applicantName: reg.applicantName,
                          gender: reg.gender,
                          age: reg.age.toString(),
                          mobileNumber: reg.mobileNumber,
                          familyMembers:
                            reg.familyMembers && reg.familyMembers !== 'None'
                              ? reg.familyMembers.split(',').map((s) => s.trim())
                              : [],
                          totalPersons: reg.totalPersons,
                          submissionTime: reg.submissionTime,
                          firestoreId: reg.id,
                          isMock: false,
                        })
                      }
                      className="p-1 text-stone-600 hover:text-red-700 bg-stone-100 rounded-lg"
                      title="View Slip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditMemberModal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        registration={editingMember}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteMemberModal
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        registration={deletingMember}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
