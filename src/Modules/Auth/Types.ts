export interface IQualification {
  degree: string[];
  diplomas: string[];
  certificate: string[];
  majorSubjects?: string[] | null;
}

export interface SignupInput {
  title: string;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  confirmPassword: string;
  role?: "student" | "teacher" | "admin";
  documentId?: string | null;
  homeAddress: string;
  proofsAddress: string;
  subjectsOffered: string;
  qualifications?: IQualification[]; // <-- updated
  proofsQualification: string;
  academicQualification:string;
  highestQualificationPerSubject: string;
  userProfilePicture?: string;
  description?: string;
  experience?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
