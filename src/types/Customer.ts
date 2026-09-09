export interface Customer {
    id: string;
    name: string;
    avatar?: string;
    joinedDate: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    totalSpend: number;
    transactionCount: number;
    lastVisit: string;
    notes?: Array<{
        id: string;
        date: string;
        text: string;
        author: string;
    }>;
}
