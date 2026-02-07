export interface TransactionItem {
    id: string;
    name: string;
    code: string;
    weight: number;
    purity: string;
    rate: number;
    makingCharges: number;
    wastage?: number;
    stoneWeight?: number;
    stoneRate?: number;
    metalType?: string;
    total: number;
}

export interface Transaction {
    id: string;
    invoiceNo: string;
    date: string; // ISO string
    customerName: string;
    customerId?: string;
    items: TransactionItem[];
    subtotal: number;
    gst: number;
    discount: number;
    exchangeTotal: number;
    exchangeItems?: any[]; // Using any to avoid importing ExchangeItem for now, or define a simplified version
    grandTotal: number;
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Split';
    status: 'Completed' | 'Pending' | 'Cancelled' | 'In Production' | 'Quality Check';
    goldRate?: number;
    imageUrl?: string;
    amountPaid?: number;
    deliveryDate?: string;
    cancellationReason?: string;
}
