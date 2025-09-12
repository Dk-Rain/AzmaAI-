

export type UserPermissions = {
    canManageUsers: boolean;
    canManageTransactions: boolean;
    canManageSettings: boolean;
}

export type User = {
    id: string;
    fullName: string;
    email: string;
    role: "Student" | "Professor" | "Teacher" | "Researcher" | "Professional" | "Admin";
    phoneNumber?: string;
    username?: string;
    photoUrl?: string;
    createdAt: string;
    permissions?: UserPermissions;
};

export type Transaction = {
    id: string;
    invoiceId: string;
    userFullName: string;
    userEmail: string;
    amount: number;
    status: 'Success' | 'Failed' | 'Pending';
    date: string;
    plan: string;
};

export type DocumentHistoryEntry = {
    docId: string;
    title: string;
    generatedAt: string;
    generatedBy: string; // In a real app, this would be a user ID
};

export type PricingSettings = {
    student: { monthly: number; yearly: number };
    professional: { monthly: number; yearly: number };
    researcher: { monthly: number; yearly: number };
    professor: { monthly: number; yearly: number };
    teacher: { monthly: number; yearly: number };
}

export type Announcement = {
    id: string;
    title: string;
    message: string;
    type: 'Info' | 'Promotion' | 'Warning' | 'Update';
    audience: 'All Users' | 'Students' | 'Professors' | 'Teachers' | 'Researchers' | 'Professionals';
    createdAt: string;
    status: 'Sent' | 'Draft';
    imageUrl?: string;
};

export type PromoCode = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number; // Total number of times the code can be used
  usedCount: number;
  usagePerUser: number; // How many times a single user can use it
  redeemedBy: string[]; // Array of user emails or IDs
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
};
