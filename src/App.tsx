import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  AlertCircle, 
  ShieldCheck 
} from 'lucide-react';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection, 
  isUserAdmin 
} from './lib/firebase';
import { ConsentFormData, FormErrors, Gender, SubmissionResult, FamilyMember, VISIT_DATE } from './types';
import { Header } from './components/Header';
import { ConsentForm } from './components/ConsentForm';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SuccessReceiptModal } from './components/SuccessReceiptModal';
import { MembersDetailsPage } from './components/MembersDetailsPage';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'form' | 'members'>('form');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

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

  // Submission Result
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Firestore Count & Sl No
  const [firestoreCount, setFirestoreCount] = useState<number>(0);
  const [nextSlNoPreview, setNextSlNoPreview] = useState<number>(1);

  // Listen to Auth State and Firestore connectivity on mount
  useEffect(() => {
    // 1. Test Firestore connection on boot
    testFirestoreConnection();

    // 2. Track authentication for Admin Access
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(isUserAdmin(user));
    });

    // 3. Listen to registered count from Firestore
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, orderBy('slNo', 'asc'));
      const unsubscribeDocs = onSnapshot(
        q,
        (snapshot) => {
          const count = snapshot.size;
          setFirestoreCount(count);
          // Determine next Sl. No.
          let maxSl = 0;
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
      return () => {
        unsubscribeAuth();
        unsubscribeDocs();
      };
    } catch (err) {
      console.warn('Failed to attach count snapshot listener:', err);
      return () => unsubscribeAuth();
    }
  }, []);

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

  // Execution: Save to Firebase Firestore Database directly
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
      // SAVE DIRECTLY TO FIREBASE FIRESTORE DATABASE
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
        dateOfVisit: VISIT_DATE,
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

      const finalResult: SubmissionResult = {
        slNo: currentSlNo,
        applicantName: formData.applicantName.trim(),
        gender: formData.gender,
        age: formData.age.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        familyMembers: cleanedMembers,
        totalPersons: totalPersonsCount,
        submissionTime: nowFormatted,
        dateOfVisit: VISIT_DATE,
        firestoreId: firestoreDocId,
        isMock: false,
      };

      setNextSlNoPreview(prev => prev + 1);

      setIsConfirmModalOpen(false);
      setSubmissionResult(finalResult);
      setIsSuccessModalOpen(true);

      // Clear form after successful database save
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
      setSubmitError(`Unable to save registration in database: ${errorMsg}`);
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
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        isAdmin={isAdmin}
        currentUser={currentUser}
        memberCount={firestoreCount}
      />

      {/* Main Content Container - Fully Mobile Optimized */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6">
        
        {/* Render Members Details Page or Form based on activeTab */}
        {activeTab === 'members' ? (
          <MembersDetailsPage
            onNavigateToForm={() => setActiveTab('form')}
            onViewReceipt={handleViewReceiptFromList}
            isAdmin={isAdmin}
            currentUser={currentUser}
            onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
          />
        ) : (
          <div>
            {/* Global Error Notice if database error occurs */}
            {submitError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-600 rounded-xl p-3.5 text-red-900 flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-bold">Database Notice</p>
                  <p className="mt-0.5 text-red-800 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {/* Mobile-Friendly Registration Form with Family Members below Applicant Name */}
            <ConsentForm
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              nextSlNoPreview={nextSlNoPreview}
              onNameChange={handleNameChange}
              onGenderChange={handleGenderChange}
              onAgeChange={handleAgeChange}
              onMobileChange={handleMobileChange}
              onAddFamilyMember={handleAddMember}
              onRemoveFamilyMember={handleRemoveMember}
              onUpdateFamilyMember={handleUpdateMember}
              onSubmit={handleInitiateSubmit}
            />
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
      />

      {/* Success Modal & Printable Acknowledgment Receipt */}
      <SuccessReceiptModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        result={submissionResult}
        onResetForm={handleResetForm}
        onViewMembersList={() => setActiveTab('members')}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

      {/* Official Footer */}
      <Footer
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
