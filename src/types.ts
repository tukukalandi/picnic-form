export type Gender = 'Male' | 'Female' | 'Other' | '';

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  age: string;
}

export interface ConsentFormData {
  applicantName: string;
  gender: Gender;
  age: string;
  mobileNumber: string;
  familyMembers: FamilyMember[];
}

export interface SubmissionResult {
  slNo: number | string;
  applicantName: string;
  gender: Gender;
  age: string;
  mobileNumber: string;
  familyMembers: string[];
  totalPersons: number;
  submissionTime: string;
  sheetName?: string;
  firestoreId?: string;
  isMock?: boolean;
}

export interface MemberRegistration {
  id: string;
  slNo: number;
  applicantName: string;
  gender: Gender;
  age: number;
  mobileNumber: string;
  familyMembers: string;
  familyMembersList?: Array<{
    name: string;
    gender: Gender;
    age: string;
  }>;
  totalPersons: number;
  submissionTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormErrors {
  applicantName?: string;
  gender?: string;
  age?: string;
  mobileNumber?: string;
  familyMembers?: { [index: number]: string };
  general?: string;
}
