

export type UserPermissions = {
    canManageUsers: boolean;
    canManageTransactions: boolean;
    canManageSettings: boolean;
}

export type UserUsage = {
    wordsUsed: number;
    documentsCreated: number;
    lastUsage: string; // ISO date string
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
    isPremium?: boolean;
    subscriptionEndDate?: string;
    usage?: UserUsage;
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
    generatedBy: string; 
};

export type PricingSettings = {
    student: { monthly: number; yearly: number };
    professional: { monthly: number; yearly: number };
    researcher: { monthly: number; yearly: number };
    professor: { monthly: number; yearly: number };
    teacher: { monthly: number; yearly: number };
};

export type AppSettings = {
    appName: string;
    allowRegistrations: boolean;
    defaultUserRole: string;
    maintenanceMode: boolean;
    paymentGatewayPublicKey: string;
    paymentGatewaySecretKey: string;
    googleAdsenseClientId?: string;
    defaultModel: 'googleai/gemini-2.5-pro' | 'googleai/gemini-2.5-flash';
};


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
  type: 'percentage' | 'fixed' | 'plan_upgrade';
  value: number; // For 'percentage' and 'fixed'
  planUpgradePrices?: { monthly: number; yearly: number }; // For 'plan_upgrade'
  usageLimit: number;
  usedCount: number;
  usagePerUser: number;
  redeemedBy: string[];
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
};

    
