import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getCountFromServer 
} from 'firebase/firestore';
import { 
  Send, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck, 
  Users, 
  ExternalLink, 
  Info,
  Link2,
  Database,
  ArrowRight
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './lib/firebase';
import { ConsentFormData, FormErrors, Gender, SubmissionResult, FamilyMember } from './types';
import { Header } from './components/Header';
import { ApplicantDetails } from './components/ApplicantDetails';
import { FamilyMembersSection } from './components/FamilyMembersSection';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SuccessReceiptModal } from './components/SuccessReceiptModal';
import { SettingsModal } from './components/SettingsModal';
import { MembersDetailsPage } from './components/MembersDetailsPage';
import { Footer } from './components/Footer';
import { SPREADSHEET_URL, SPREADSHEET_ID } from './data/backendCode';

const STORAGE_URL_KEY = 'dhenkanal_so_apps_script_url';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'form' | 'members'>('form');

  // Form State with Age
  const [formData, setFormData] = useState<ConsentFormData>({
    applicantName: '',
    gender: '',
    age: '',
    mobileNumber: '',
    familyMembers: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'config' | 'code' | 'guide'>('config');

  // Submission Result
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Configuration & Firestore State
  const [webAppUrl, setWebAppUrl] = useState<string>('');
  const [quickUrlInput, setQuickUrlInput] = useState<string>('');
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [firestoreCount, setFirestoreCount] = useState<number>(0);
  const [nextSlNoPreview, setNextSlNoPreview] = useState<number>(1);
  const [isUrlBarExpanded, setIsUrlBarExpanded] = useState<boolean>(false);

  // Load saved configuration and test Firestore connectivity on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
    setWebAppUrl(savedUrl);
    setQuickUrlInput(savedUrl);

    // Test Firestore connection on boot
    testFirestoreConnection();

    // Listen to registered count from Firestore
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, orderBy('slNo', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const count = snapshot.size;
          setFirestoreCount(count);
          // Set next Sl. No. based on highest existing serial number
          let maxSl = count;
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.slNo && typeof data.slNo === 'number' && data.slNo > maxSl) {
              maxSl = data.slNo;
            }
          });
          setNextSlNoPreview(maxSl + 1);
        },
        (err) => {
          console.warn('Firestore snapshot error on count:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to attach count snapshot listener:', err);
    }
  }, []);

  // Save URL changes to localStorage
  const handleSaveUrl = (url: string) => {
    const trimmed = url.trim();
    setWebAppUrl(trimmed);
    setQuickUrlInput(trimmed);
    localStorage.setItem(STORAGE_URL_KEY, trimmed);
    if (trimmed.length > 0) {
      setIsMockMode(false);
      setIsUrlBarExpanded(false);
    }
  };

  // Form Field Handlers
  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, applicantName: name }));
    if (errors.applicantName) setErrors(prev => ({ ...prev, applicantName: undefined }));
  };

  const handleGenderChange = (gender: Gender) => {
    setFormData(prev => ({ ...prev, gender }));
    if (errors.gender) setErrors(prev => ({ ...prev, gender: undefined }));
  };

  const handleAgeChange = (age: string) => {
    setFormData(prev => ({ ...prev, age }));
    if (errors.age) setErrors(prev => ({ ...prev, age: undefined }));
  };

  const handleMobileChange = (mobile: string) => {
    setFormData(prev => ({ ...prev, mobileNumber: mobile }));
    if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: undefined }));
  };

  // Family Members Handlers
  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name: '', gender: '', age: '' },
      ],
    }));
  };

  const handleRemoveMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== id),
    }));
    setErrors(prev => ({ ...prev, familyMembers: undefined }));
  };

  const handleUpdateMember = (id: string, updates: Partial<FamilyMember>) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => (m.id === id ? { ...m, ...updates } : m)),
    }));
    if (errors.familyMembers) {
      setErrors(prev => ({ ...prev, familyMembers: undefined }));
    }
  };

  // Validation Logic
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const memberErrors: { [key: number]: string } = {};

    // 1. Applicant Name validation
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Please enter the applicant (postal agent) full name.';
    } else if (formData.applicantName.trim().length < 2) {
      newErrors.applicantName = 'Applicant name must be at least 2 characters.';
    }

    // 2. Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender option.';
    }

    // 3. Age validation (Required)
    const ageNum = parseInt(formData.age.trim(), 10);
    if (!formData.age.trim()) {
      newErrors.age = 'Please enter age in years.';
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      newErrors.age = 'Please enter a valid age between 18 and 100.';
    }

    // 4. Indian Mobile Number validation (10 digits starting with 6,7,8,9)
    const mobileTrimmed = formData.mobileNumber.trim();
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileTrimmed) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!mobileRegex.test(mobileTrimmed)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    // 5. Family Members validation
    formData.familyMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        memberErrors[index] = 'Please enter family member name or click Remove.';
      }
    });

    if (Object.keys(memberErrors).length > 0) {
      newErrors.familyMembers = memberErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Click on "Submit Consent" -> Validate & Show Confirmation Dialog
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Execution: Save to Firebase Firestore Database + Forward to Google Sheets
  const handleExecuteSubmission = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const cleanedMembers = formData.familyMembers
      .map(m => {
        const nameClean = m.name.trim();
        if (!nameClean) return '';
        const details = [m.gender, m.age ? `${m.age} yrs` : ''].filter(Boolean).join(', ');
        return details ? `${nameClean} (${details})` : nameClean;
      })
      .filter(m => m.length > 0);

    const familyMembersList = formData.familyMembers
      .filter(m => m.name.trim().length > 0)
      .map(m => ({
        name: m.name.trim(),
        gender: m.gender,
        age: m.age.trim(),
      }));

    const totalPersonsCount = 1 + cleanedMembers.length;
    const nowFormatted = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Asia/Kolkata',
    }).format(new Date()) + ' (IST)';

    const currentSlNo = nextSlNoPreview;

    try {
      // 1. SAVE TO FIREBASE FIRESTORE DATABASE (Primary Persistence)
      const firestorePayload = {
        slNo: currentSlNo,
        applicantName: formData.applicantName.trim(),
        gender: formData.gender,
        age: parseInt(formData.age.trim(), 10),
        mobileNumber: formData.mobileNumber.trim(),
        familyMembers: cleanedMembers.join(', ') || 'None',
        familyMembersList: familyMembersList,
        totalPersons: totalPersonsCount,
        submissionTime: nowFormatted,
        createdAt: new Date().toISOString(),
      };

      let firestoreDocId = '';
      try {
        const docRef = await addDoc(collection(db, 'registrations'), firestorePayload);
        firestoreDocId = docRef.id;
      } catch (firestoreErr) {
        console.error('Firestore save failed:', firestoreErr);
        handleFirestoreError(firestoreErr, OperationType.CREATE, 'registrations');
      }

      // 2. FORWARD TO GOOGLE SPREADSHEET (Secondary Sync if Web App URL configured)
      const activeUrl = webAppUrl.trim();
      if (activeUrl && !isMockMode) {
        const sheetPayload = {
          applicantName: formData.applicantName.trim(),
          gender: formData.gender,
          age: formData.age.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          familyMembers: cleanedMembers,
          totalPersons: totalPersonsCount,
          timestamp: new Date().toISOString(),
        };

        // Fire-and-forget sync or server proxy
        fetch('/api/submit-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webAppUrl: activeUrl, payload: sheetPayload }),
        }).catch(err => {
          console.warn('Sheet sync warning:', err);
        });
      }

      const finalResult: SubmissionResult = {
        slNo: currentSlNo,
        applicantName: formData.applicantName.trim(),
        gender: formData.gender,
        age: formData.age.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        familyMembers: cleanedMembers,
        totalPersons: totalPersonsCount,
        submissionTime: nowFormatted,
        firestoreId: firestoreDocId,
        isMock: false,
      };

      setNextSlNoPreview(prev => prev + 1);

      setIsConfirmModalOpen(false);
      setSubmissionResult(finalResult);
      setIsSuccessModalOpen(true);

      // Clear form only after successful database save
      setFormData({
        applicantName: '',
        gender: '',
        age: '',
        mobileNumber: '',
        familyMembers: [],
      });
      setErrors({});

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setIsConfirmModalOpen(false);
      setSubmitError(`Unable to complete registration in database: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccessModalOpen(false);
    setSubmissionResult(null);
    setSubmitError(null);
    setFormData({
      applicantName: '',
      gender: '',
      age: '',
      mobileNumber: '',
      familyMembers: [],
    });
    setErrors({});
  };

  const handleViewReceiptFromList = (result: SubmissionResult) => {
    setSubmissionResult(result);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => {
          setSettingsTab('config');
          setIsSettingsOpen(true);
        }}
        onOpenGuide={() => {
          setSettingsTab('guide');
          setIsSettingsOpen(true);
        }}
        isLiveConfigured={Boolean(webAppUrl.trim())}
        isMockMode={isMockMode}
        memberCount={firestoreCount}
      />

      {/* Main Content Container - Optimized for mobile phone screens */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6">
        
        {/* Render Members Details Page or Form based on activeTab */}
        {activeTab === 'members' ? (
          <MembersDetailsPage
            onNavigateToForm={() => setActiveTab('form')}
            onViewReceipt={handleViewReceiptFromList}
          />
        ) : (
          <div>
            {/* Global Error Notice if submission failed */}
            {submitError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-600 rounded-xl p-3.5 text-red-900 flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-bold">Database Error</p>
                  <p className="mt-0.5 text-red-800 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleInitiateSubmit} noValidate className="space-y-4">
              {/* Section 1: Applicant Details */}
              <ApplicantDetails
                applicantName={formData.applicantName}
                gender={formData.gender}
                age={formData.age}
                mobileNumber={formData.mobileNumber}
                onNameChange={handleNameChange}
                onGenderChange={handleGenderChange}
                onAgeChange={handleAgeChange}
                onMobileChange={handleMobileChange}
                errors={errors}
                nextSlNoPreview={nextSlNoPreview}
              />

              {/* Section 2: Family Members Section */}
              <FamilyMembersSection
                familyMembers={formData.familyMembers}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onUpdateMember={handleUpdateMember}
                errors={errors.familyMembers || {}}
              />

              {/* Mobile-Friendly Submit Action Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm px-1">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Users className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-stone-700">Total Headcount:</span>
                  </div>
                  <span className="font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg text-sm">
                    {1 + formData.familyMembers.length} Person(s)
                  </span>
                </div>

                {/* Big Thumb-Friendly Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-extrabold text-base text-white shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting
                      ? 'bg-red-400 cursor-not-allowed opacity-75'
                      : 'bg-red-600 hover:bg-red-700 active:bg-red-800 border-b-2 border-red-900'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving Registration...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Consent</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dhenkanal RS Sub Post Office • Official Portal</span>
                </p>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecuteSubmission}
        formData={formData}
        isSubmitting={isSubmitting}
        webAppUrl={webAppUrl}
      />

      {/* Success Modal & Printable Acknowledgment Receipt */}
      <SuccessReceiptModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        result={submissionResult}
        onResetForm={handleResetForm}
        onViewMembersList={() => setActiveTab('members')}
      />

      {/* Settings / Guide Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webAppUrl={webAppUrl}
        onSaveUrl={handleSaveUrl}
        isMockMode={isMockMode}
        onToggleMockMode={setIsMockMode}
        initialTab={settingsTab}
      />

      {/* Official Footer */}
      <Footer
        onOpenSettings={() => {
          setSettingsTab('config');
          setIsSettingsOpen(true);
        }}
        onOpenGuide={() => {
          setSettingsTab('guide');
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
