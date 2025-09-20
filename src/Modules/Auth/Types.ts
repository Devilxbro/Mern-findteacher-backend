


export interface SignupInput {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "student" | "teacher" | "admin";
  documentId?: string;
  homeAddress: string;
  proofsAddress: string;
  subjectsOffered: string;
  academicQualification: string;
  proofsQualification: string;
  highestQualificationPerSubject: string;
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
