

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
